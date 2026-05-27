const db = require('./db');
const bcrypt = require('bcryptjs');

const createTablesIfNotExist = async () => {
  console.log('Ensuring database schema exists...');
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone_number VARCHAR(50),
      profile_image VARCHAR(255),
      gender VARCHAR(20),
      address VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(20),
      account_status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS sellers (
      seller_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      seller_name VARCHAR(255) NOT NULL,
      business_name VARCHAR(255) NOT NULL,
      gst_number VARCHAR(50),
      email VARCHAR(255) NOT NULL,
      phone_number VARCHAR(50),
      warehouse_address VARCHAR(255),
      bank_details VARCHAR(255),
      seller_logo VARCHAR(255),
      verification_status VARCHAR(50) NOT NULL,
      revenue NUMERIC(19, 2) DEFAULT 0.00,
      ratings DOUBLE PRECISION DEFAULT 0.0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      product_id BIGSERIAL PRIMARY KEY,
      product_name VARCHAR(255) NOT NULL,
      description VARCHAR(1000),
      category VARCHAR(255) NOT NULL,
      brand VARCHAR(255),
      sku VARCHAR(255) UNIQUE NOT NULL,
      price NUMERIC(19, 2) NOT NULL,
      discount_price NUMERIC(19, 2),
      stock_quantity INTEGER NOT NULL,
      ratings DOUBLE PRECISION DEFAULT 0.0,
      delivery_info VARCHAR(255),
      seller_id BIGINT NOT NULL REFERENCES sellers(seller_id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
      image_url VARCHAR(255) NOT NULL,
      PRIMARY KEY (product_id, image_url)
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS product_specifications (
      product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
      spec_key VARCHAR(255) NOT NULL,
      spec_value VARCHAR(255) NOT NULL,
      PRIMARY KEY (product_id, spec_key)
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS customer_wishlist (
      customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
      PRIMARY KEY (customer_id, product_id)
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS carts (
      cart_id BIGSERIAL PRIMARY KEY,
      customer_id BIGINT UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      total_amount NUMERIC(19, 2) DEFAULT 0.00
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      cart_item_id BIGSERIAL PRIMARY KEY,
      cart_id BIGINT NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      subtotal NUMERIC(19, 2) NOT NULL
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id BIGSERIAL PRIMARY KEY,
      customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      seller_id BIGINT NOT NULL REFERENCES sellers(seller_id) ON DELETE CASCADE,
      total_amount NUMERIC(19, 2) NOT NULL,
      payment_method VARCHAR(100),
      payment_status VARCHAR(50) NOT NULL,
      shipping_address VARCHAR(255) NOT NULL,
      delivery_status VARCHAR(50) NOT NULL,
      tracking_id VARCHAR(100),
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      delivery_date TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      price NUMERIC(19, 2) NOT NULL,
      subtotal NUMERIC(19, 2) NOT NULL
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id BIGSERIAL PRIMARY KEY,
      code VARCHAR(255) UNIQUE NOT NULL,
      discount_percentage NUMERIC(19, 2) NOT NULL,
      max_discount_amount NUMERIC(19, 2),
      expiry_date TIMESTAMP NOT NULL,
      active BOOLEAN DEFAULT TRUE
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message VARCHAR(1000) NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id BIGSERIAL PRIMARY KEY,
      rating DOUBLE PRECISION NOT NULL,
      comment VARCHAR(1000),
      customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database schema ensured.');
};

const seedData = async () => {
  try {
    await createTablesIfNotExist();

    // 1. Seed Admin
    const adminCheck = await db.query("SELECT * FROM users WHERE email = $1", ["admin@frais.com"]);
    if (adminCheck.rows.length === 0) {
      const hashedPw = await bcrypt.hash("admin123", 10);
      await db.query(
        "INSERT INTO users (email, password, role) VALUES ($1, $2, $3)",
        ["admin@frais.com", hashedPw, "ROLE_ADMIN"]
      );
      console.log("Seeded Default Admin: admin@frais.com / admin123");
    }

    // 2. Seed Customer
    let customerUserId = null;
    const customerCheck = await db.query("SELECT * FROM users WHERE email = $1", ["customer@frais.com"]);
    if (customerCheck.rows.length === 0) {
      const hashedPw = await bcrypt.hash("customer123", 10);
      const userRes = await db.query(
        "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id",
        ["customer@frais.com", hashedPw, "ROLE_CUSTOMER"]
      );
      customerUserId = userRes.rows[0].id;

      await db.query(
        `INSERT INTO customers (id, full_name, email, phone_number, gender, address, city, state, pincode, account_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          customerUserId,
          "Ritesh Prasad",
          "customer@frais.com",
          "9876543210",
          "MALE",
          "123 Green Avenue, Sector 5",
          "Delhi",
          "Delhi",
          "110001",
          "ACTIVE"
        ]
      );

      await db.query(
        "INSERT INTO carts (customer_id, total_amount) VALUES ($1, $2)",
        [customerUserId, 0.0]
      );
      console.log("Seeded Default Customer: customer@frais.com / customer123");
    } else {
      customerUserId = customerCheck.rows[0].id;
    }

    // 3. Seed Seller
    let sellerUserId = null;
    const sellerCheck = await db.query("SELECT * FROM users WHERE email = $1", ["seller@frais.com"]);
    if (sellerCheck.rows.length === 0) {
      const hashedPw = await bcrypt.hash("seller123", 10);
      const userRes = await db.query(
        "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id",
        ["seller@frais.com", hashedPw, "ROLE_SELLER"]
      );
      sellerUserId = userRes.rows[0].id;

      await db.query(
        `INSERT INTO sellers (seller_id, seller_name, business_name, gst_number, email, phone_number, warehouse_address, bank_details, verification_status, revenue, ratings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          sellerUserId,
          "Ritesh Kumar",
          "Frais Organics Inc.",
          "22AAAAA0000A1Z5",
          "seller@frais.com",
          "8887776665",
          "Eco Park Logistic, Bay 4, Gurgaon",
          "HDFC bank, A/C: 5010022334455, IFSC: HDFC0000123",
          "APPROVED",
          0.0,
          4.8
        ]
      );
      console.log("Seeded Default Seller: seller@frais.com / seller123");
    } else {
      sellerUserId = sellerCheck.rows[0].id;
    }

    // 4. Seed Products
    const prodCountRes = await db.query("SELECT COUNT(*) FROM products");
    const count = parseInt(prodCountRes.rows[0].count, 10);
    const ethnicCheckRes = await db.query("SELECT * FROM products WHERE product_name LIKE '%Saree%' LIMIT 1");
    const hasEthnic = ethnicCheckRes.rows.length > 0;

    if ((count < 5 || !hasEthnic) && sellerUserId) {
      if (!hasEthnic && count > 0) {
        // Clear references
        await db.query("DELETE FROM product_images");
        await db.query("DELETE FROM product_specifications");
        await db.query("DELETE FROM customer_wishlist");
        await db.query("DELETE FROM cart_items");
        await db.query("DELETE FROM order_items");
        await db.query("DELETE FROM reviews");
        await db.query("DELETE FROM products");
        console.log("Cleared old products to re-seed Indian Ethnic Wear!");
      }

      const productsToSeed = [
        // --- Sarees ---
        {
          name: "Sage Green Silk Saree",
          desc: "A beautiful silk saree in a soothing sage green color, featuring subtle zari embroidery and an elegant border. Ideal for wedding events and formal celebrations.",
          cat: "Sarees", brand: "Frais Luxe", sku: "SKU-SAREE-01", price: 120.00, discPrice: 99.00, stock: 20,
          image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
          specs: "Fabric: Art Silk, Color: Sage Green, Length: 5.5 meters", delivery: "Ships in 24 hours."
        },
        {
          name: "Banarasi Silk Saree in Pink",
          desc: "Classic Banarasi Katan Silk saree in vibrant pink, adorned with intricate golden zari floral weaves and a heavy brocade border.",
          cat: "Sarees", brand: "Heritage Weaves", sku: "SKU-SAREE-02", price: 185.00, discPrice: 160.00, stock: 15,
          image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=600",
          specs: "Fabric: Pure Katan Silk, Color: Fuchsia Pink, Work: Golden Zari", delivery: "Ships in 2-3 business days."
        },
        {
          name: "Crimson Red Georgette Saree",
          desc: "Lightweight crimson red georgette saree featuring delicate sequin borders and hand-embroidered buttis throughout. Perfect for cocktail parties.",
          cat: "Sarees", brand: "Frais Glam", sku: "SKU-SAREE-03", price: 95.00, discPrice: null, stock: 30,
          image: "https://images.unsplash.com/photo-1610030470298-4c3e34b4c73b?w=600",
          specs: "Fabric: Georgette, Color: Crimson Red, Detail: Sequin Work", delivery: "Ships in 24 hours."
        },
        {
          name: "Midnight Black Net Saree",
          desc: "Exquisite black net saree showcasing rich threadwork, floral motifs, and a scalloped border. Includes a matching unstitched blouse piece.",
          cat: "Sarees", brand: "Frais Luxe", sku: "SKU-SAREE-04", price: 140.00, discPrice: 125.00, stock: 12,
          image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
          specs: "Fabric: Net, Color: Midnight Black, Work: Resham Threadwork", delivery: "Ships in 24 hours."
        },
        // --- Salwar Kameez ---
        {
          name: "Olive Green Anarkali Suit",
          desc: "Floor-length olive green georgette Anarkali gown with complex golden thread embroidery on the yoke and cuffs. Comes with a matching dupatta.",
          cat: "Salwar Kameez", brand: "Royal Silks", sku: "SKU-SUIT-01", price: 110.00, discPrice: 95.00, stock: 25,
          image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
          specs: "Fabric: Georgette, Style: Anarkali Gown, Sleeve: Full Sleeve", delivery: "Ships in 24 hours."
        },
        {
          name: "Mustard Yellow Sharara Set",
          desc: "Chic mustard yellow georgette short kurti paired with a flared sharara pants and a matching floral printed organza dupatta.",
          cat: "Salwar Kameez", brand: "Frais Active", sku: "SKU-SUIT-02", price: 85.00, discPrice: 75.00, stock: 35,
          image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600",
          specs: "Fabric: Georgette & Organza, Color: Mustard Yellow, Style: Sharara Set", delivery: "Ships in 24 hours."
        },
        {
          name: "Peach Georgette Palazzo Suit",
          desc: "Elegantly crafted peach straight-cut salwar suit with mirror work on the neckline, paired with comfortable wide-leg palazzo pants.",
          cat: "Salwar Kameez", brand: "Frais Essentials", sku: "SKU-SUIT-03", price: 79.99, discPrice: null, stock: 40,
          image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
          specs: "Fabric: Faux Georgette, Color: Soft Peach, Style: Palazzo Suit", delivery: "Ships in 24 hours."
        },
        {
          name: "Lavender Silk Straight Suit",
          desc: "Premium lavender chanderi silk straight suit with gold foil print detailing and coordinates. Accompanied by a matching silk dupatta.",
          cat: "Salwar Kameez", brand: "Royal Silks", sku: "SKU-SUIT-04", price: 98.00, discPrice: 89.00, stock: 18,
          image: "https://images.unsplash.com/photo-1619551186249-b7cd8c660d55?w=600",
          specs: "Fabric: Chanderi Silk, Color: Lavender, Style: Straight Cut", delivery: "Ships in 24 hours."
        },
        // --- Lehengas ---
        {
          name: "Coral Pink Mirror Lehenga",
          desc: "A vibrant coral pink georgette lehenga choli set heavily detailed with mirror-work, sequins, and a contrasting golden bordered dupatta.",
          cat: "Lehengas", brand: "Frais Glam", sku: "SKU-LEH-01", price: 299.00, discPrice: 249.99, stock: 10,
          image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
          specs: "Fabric: Georgette, Color: Coral Pink, Work: Real Mirror & Sequins", delivery: "Ships in 3-5 business days."
        },
        {
          name: "Wine Red Velvet Lehenga",
          desc: "Heavy velvet bridal lehenga in rich wine red, featuring royal gold zari embroidery and hand-sewn stonework. A true heirloom piece.",
          cat: "Lehengas", brand: "Frais Luxe", sku: "SKU-LEH-02", price: 450.00, discPrice: 399.00, stock: 8,
          image: "https://images.unsplash.com/photo-1610030470298-4c3e34b4c73b?w=600",
          specs: "Fabric: Premium Velvet, Color: Wine Red, Work: Heavy Zari & Stone", delivery: "Ships in 5-7 business days."
        },
        {
          name: "Floral Print Organza Lehenga",
          desc: "A lightweight, breezy organza lehenga set featuring digital pastel floral prints, a sequin-embellished blouse, and a soft net dupatta.",
          cat: "Lehengas", brand: "Frais Essentials", sku: "SKU-LEH-03", price: 160.00, discPrice: null, stock: 20,
          image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=600",
          specs: "Fabric: Organza, Color: Pastel Floral, Weight: Light", delivery: "Ships in 24 hours."
        },
        // --- Indo Western ---
        {
          name: "Lime Green Dhoti Set",
          desc: "A modern drape set featuring a lime green asymmetric georgette tunic paired with matching dhoti pants. Adorned with a hand-embroidered belt.",
          cat: "Indo Western", brand: "Frais Active", sku: "SKU-INDO-01", price: 115.00, discPrice: 99.00, stock: 15,
          image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
          specs: "Fabric: Georgette, Style: Dhoti & Tunic, Color: Lime Green", delivery: "Ships in 24 hours."
        },
        {
          name: "Palazzo Crop Top Shrug Set",
          desc: "Three-piece fusion set consisting of georgette wide-leg palazzos, a matching crop top, and a flowing printed georgette cape/shrug.",
          cat: "Indo Western", brand: "Frais Essentials", sku: "SKU-INDO-02", price: 92.00, discPrice: 85.00, stock: 22,
          image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600",
          specs: "Fabric: Georgette, Style: Crop Top & Palazzo with Shrug", delivery: "Ships in 24 hours."
        },
        {
          name: "Asymmetric Rose Drape Kurta",
          desc: "An elegant cowl-drape asymmetric kurta in dusty rose satin, detailed with a sequin cuff and matching fitted pencil pants.",
          cat: "Indo Western", brand: "Frais Glam", sku: "SKU-INDO-03", price: 105.00, discPrice: null, stock: 17,
          image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
          specs: "Fabric: Premium Satin, Color: Dusty Rose, Style: Cowl Drape Kurta", delivery: "Ships in 24 hours."
        },
        // --- Men ---
        {
          name: "Cream Sherwani Set",
          desc: "A classic cream raw-silk sherwani set with fine self-embroidery, complete with matching churidar pants and a gold tissue stole.",
          cat: "Men", brand: "Heritage Weaves", sku: "SKU-MEN-01", price: 240.00, discPrice: 199.99, stock: 14,
          image: "https://images.unsplash.com/photo-1597983073492-bc24058ba262?w=600",
          specs: "Fabric: Raw Silk, Color: Cream / Off-White, Style: Groom's Sherwani", delivery: "Ships in 3-5 business days."
        },
        {
          name: "Mustard Tussar Silk Kurta",
          desc: "A comfortable mustard yellow kurta crafted from premium Tussar silk. Features a band collar and matching cream pajama pants.",
          cat: "Men", brand: "Frais Essentials", sku: "SKU-MEN-02", price: 55.00, discPrice: 48.00, stock: 30,
          image: "https://images.unsplash.com/photo-1597983073492-bc24058ba262?w=600",
          specs: "Fabric: Tussar Silk, Color: Mustard Yellow, Style: Straight Kurta", delivery: "Ships in 24 hours."
        },
        {
          name: "Nehru Jacket Kurta Set",
          desc: "A floral printed jacquard Nehru jacket paired with a solid cream cotton-silk kurta and churidar pants. Perfect for sangeet functions.",
          cat: "Men", brand: "Heritage Weaves", sku: "SKU-MEN-03", price: 99.00, discPrice: null, stock: 25,
          image: "https://images.unsplash.com/photo-1597983073492-bc24058ba262?w=600",
          specs: "Jacket Fabric: Jacquard, Kurta Fabric: Cotton Silk, Set: 3 Piece", delivery: "Ships in 24 hours."
        },
        // --- Jewellery ---
        {
          name: "Kundan Pearl Choker Set",
          desc: "A high-quality traditional Kundan choker necklace embellished with green enamel work and dropping freshwater pearls. Includes matching earrings.",
          cat: "Jewellery", brand: "Frais Luxe", sku: "SKU-JEWEL-01", price: 65.00, discPrice: 55.00, stock: 15,
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
          specs: "Material: Brass Alloy, Stone: Kundan & Faux Pearl, Plating: 22k Gold", delivery: "Ships in 24 hours."
        },
        {
          name: "Temple Gold Plated Necklace",
          desc: "South Indian style temple jewellery long necklace depicting intricate carvings of Goddess Lakshmi, adorned with red ruby stones.",
          cat: "Jewellery", brand: "Heritage Weaves", sku: "SKU-JEWEL-02", price: 75.00, discPrice: 68.00, stock: 10,
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
          specs: "Material: Copper Base, Stone: Rubies, Detail: Laxmi Coin Design", delivery: "Ships in 24 hours."
        },
        {
          name: "Antique Jhumka Earrings",
          desc: "Beautifully detailed antique gold-plated dome jhumkas with small hanging seed pearls. Perfect accompaniment for sarees.",
          cat: "Jewellery", brand: "Frais Essentials", sku: "SKU-JEWEL-03", price: 29.99, discPrice: null, stock: 50,
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
          specs: "Material: Alloy, Style: Hanging Jhumka, Weight: 18g", delivery: "Ships in 24 hours."
        }
      ];

      for (const p of productsToSeed) {
        const ratings = 4.5 + Math.random() * 0.5;
        const prodRes = await db.query(
          `INSERT INTO products (product_name, description, category, brand, sku, price, discount_price, stock_quantity, ratings, delivery_info, seller_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING product_id`,
          [
            p.name,
            p.desc,
            p.cat,
            p.brand,
            p.sku,
            p.price,
            p.discPrice,
            p.stock,
            ratings,
            p.delivery,
            sellerUserId
          ]
        );
        const productId = prodRes.rows[0].product_id;

        // Seed product images
        await db.query(
          "INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)",
          [productId, p.image]
        );

        // Seed specifications
        if (p.specs) {
          const parts = p.specs.split(",");
          for (const part of parts) {
            const kv = part.split(":");
            if (kv.length === 2) {
              await db.query(
                "INSERT INTO product_specifications (product_id, spec_key, spec_value) VALUES ($1, $2, $3)",
                [productId, kv[0].trim(), kv[1].trim()]
              );
            }
          }
        }
      }
      console.log(`Seeded ${productsToSeed.length} Premium Indian Ethnic Wear Products successfully!`);
    }

    // Seed some orders and order items to populate graphs
    const ordersCountRes = await db.query("SELECT COUNT(*) FROM orders");
    const ordersCount = parseInt(ordersCountRes.rows[0].count, 10);
    if (ordersCount === 0 && customerUserId && sellerUserId) {
      const prodsRes = await db.query("SELECT product_id, price, discount_price, product_name, category FROM products LIMIT 5");
      if (prodsRes.rows.length > 0) {
        const statuses = ['DELIVERED', 'SHIPPED', 'PENDING', 'CANCELLED', 'DELIVERED'];
        const paymentStatuses = ['PAID', 'PAID', 'PENDING', 'FAILED', 'PAID'];
        const dates = [
          "NOW() - INTERVAL '5 days'",
          "NOW() - INTERVAL '4 days'",
          "NOW() - INTERVAL '3 days'",
          "NOW() - INTERVAL '2 days'",
          "NOW() - INTERVAL '1 days'"
        ];
        for (let i = 0; i < 5; i++) {
          const prod = prodsRes.rows[i % prodsRes.rows.length];
          const price = parseFloat(prod.discount_price || prod.price);
          const total = price * 2;
          const orderRes = await db.query(
            `INSERT INTO orders (customer_id, seller_id, total_amount, payment_method, payment_status, shipping_address, delivery_status, order_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, ${dates[i]}) RETURNING order_id`,
            [
              customerUserId,
              sellerUserId,
              total,
              'UPI',
              paymentStatuses[i],
              'Sector 15, Block B, Flat 405, Noida, UP',
              statuses[i]
            ]
          );
          const orderId = orderRes.rows[0].order_id;
          await db.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
             VALUES ($1, $2, $3, $4, $5)`,
            [orderId, prod.product_id, 2, price, total]
          );
        }
        console.log("Seeded default orders for dashboard graph populating!");
      }
    }

    // Seed some reviews
    const reviewsCountRes = await db.query("SELECT COUNT(*) FROM reviews");
    const reviewsCount = parseInt(reviewsCountRes.rows[0].count, 10);
    if (reviewsCount === 0 && customerUserId) {
      const prodsRes = await db.query("SELECT product_id FROM products LIMIT 3");
      for (const p of prodsRes.rows) {
        await db.query(
          `INSERT INTO reviews (rating, comment, customer_id, product_id)
           VALUES ($1, $2, $3, $4)`,
          [5.0, "Absolutely gorgeous fabric! The quality is premium and the colors are vibrant.", customerUserId, p.product_id]
        );
      }
      console.log("Seeded default reviews for testing!");
    }

    // Seed default coupons
    const couponsCountRes = await db.query("SELECT COUNT(*) FROM coupons");
    const couponsCount = parseInt(couponsCountRes.rows[0].count, 10);
    if (couponsCount === 0) {
      await db.query(`
        INSERT INTO coupons (code, discount_percentage, max_discount_amount, expiry_date, active)
        VALUES 
          ('WELCOME10', 10.00, 500.00, NOW() + INTERVAL '1 year', true),
          ('VELOCE20', 20.00, 1000.00, NOW() + INTERVAL '1 year', true),
          ('JAYPORE20', 20.00, 1000.00, NOW() + INTERVAL '1 year', true)
        ON CONFLICT (code) DO NOTHING
      `);
      console.log("Seeded default coupons (WELCOME10, VELOCE20, JAYPORE20) successfully!");
    }
  } catch (err) {
    console.error("Error during database seeding:", err);
  }
};

module.exports = {
  seedData
};
