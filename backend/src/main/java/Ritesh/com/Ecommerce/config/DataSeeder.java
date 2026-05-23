package Ritesh.com.Ecommerce.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import Ritesh.com.Ecommerce.entity.*;
import Ritesh.com.Ecommerce.enums.Role;
import Ritesh.com.Ecommerce.enums.VerificationStatus;
import Ritesh.com.Ecommerce.enums.AccountStatus;
import Ritesh.com.Ecommerce.enums.Gender;
import Ritesh.com.Ecommerce.repository.*;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      SellerRepository sellerRepository,
                      CustomerRepository customerRepository,
                      ProductRepository productRepository,
                      CartRepository cartRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.sellerRepository = sellerRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Admin
        if (!userRepository.existsByEmail("admin@frais.com")) {
            User adminUser = User.builder()
                    .email("admin@frais.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .build();
            userRepository.save(adminUser);
            System.out.println("Seeded Default Admin: admin@frais.com / admin123");
        }

        // 2. Seed Customer
        User customerUser = null;
        if (!userRepository.existsByEmail("customer@frais.com")) {
            customerUser = User.builder()
                    .email("customer@frais.com")
                    .password(passwordEncoder.encode("customer123"))
                    .role(Role.ROLE_CUSTOMER)
                    .build();
            customerUser = userRepository.save(customerUser);

            Customer customer = Customer.builder()
                    .id(customerUser.getId())
                    .user(customerUser)
                    .fullName("Ritesh Prasad")
                    .email("customer@frais.com")
                    .phoneNumber("9876543210")
                    .gender(Gender.MALE)
                    .address("123 Green Avenue, Sector 5")
                    .city("Delhi")
                    .state("Delhi")
                    .pincode("110001")
                    .accountStatus(AccountStatus.ACTIVE)
                    .build();
            customer = customerRepository.save(customer);

            Cart cart = Cart.builder()
                    .customer(customer)
                    .totalAmount(BigDecimal.ZERO)
                    .build();
            cartRepository.save(cart);
            System.out.println("Seeded Default Customer: customer@frais.com / customer123");
        }

        // 3. Seed Seller
        Seller seller = null;
        if (!userRepository.existsByEmail("seller@frais.com")) {
            User sellerUser = User.builder()
                    .email("seller@frais.com")
                    .password(passwordEncoder.encode("seller123"))
                    .role(Role.ROLE_SELLER)
                    .build();
            sellerUser = userRepository.save(sellerUser);

            seller = Seller.builder()
                    .sellerId(sellerUser.getId())
                    .user(sellerUser)
                    .sellerName("Ritesh Kumar")
                    .businessName("Frais Organics Inc.")
                    .gstNumber("22AAAAA0000A1Z5")
                    .email("seller@frais.com")
                    .phoneNumber("8887776665")
                    .warehouseAddress("Eco Park Logistic, Bay 4, Gurgaon")
                    .bankDetails("HDFC bank, A/C: 5010022334455, IFSC: HDFC0000123")
                    .verificationStatus(VerificationStatus.APPROVED)
                    .revenue(BigDecimal.ZERO)
                    .ratings(4.8)
                    .build();
            seller = sellerRepository.save(seller);
            System.out.println("Seeded Default Seller: seller@frais.com / seller123");
        } else {
            User sellerUser = userRepository.findByEmail("seller@frais.com").orElse(null);
            if (sellerUser != null) {
                seller = sellerRepository.findById(sellerUser.getId()).orElse(null);
            }
        }

        // 4. Seed Products (if database is empty or doesn't have ethnic products)
        boolean hasEthnicProducts = productRepository.findAll().stream()
                .anyMatch(p -> p.getProductName().contains("Saree"));

        if ((productRepository.count() < 5 || !hasEthnicProducts) && seller != null) {
            if (!hasEthnicProducts) {
                productRepository.deleteAll();
                System.out.println("Cleared old products to re-seed Indian Ethnic Wear!");
            }
            List<Product> products = new ArrayList<>();

            // --- CATEGORY: Sarees ---
            products.add(createProduct(
                    "Sage Green Silk Saree",
                    "A beautiful silk saree in a soothing sage green color, featuring subtle zari embroidery and an elegant border. Ideal for wedding events and formal celebrations.",
                    "Sarees", "Frais Luxe", "SKU-SAREE-01", 120.00, 99.00, 20,
                    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
                    "Fabric: Art Silk, Color: Sage Green, Length: 5.5 meters", "Ships in 24 hours.", seller
            ));
            products.add(createProduct(
                    "Banarasi Silk Saree in Pink",
                    "Classic Banarasi Katan Silk saree in vibrant pink, adorned with intricate golden zari floral weaves and a heavy brocade border.",
                    "Sarees", "Heritage Weaves", "SKU-SAREE-02", 185.00, 160.00, 15,
                    "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=600",
                    "Fabric: Pure Katan Silk, Color: Fuchsia Pink, Work: Golden Zari", "Ships in 2-3 business days.", seller
            ));
            products.add(createProduct(
                    "Crimson Red Georgette Saree",
                    "Lightweight crimson red georgette saree featuring delicate sequin borders and hand-embroidered buttis throughout. Perfect for cocktail parties.",
                    "Sarees", "Frais Glam", "SKU-SAREE-03", 95.00, null, 30,
                    "https://images.unsplash.com/photo-1610030470298-4c3e34b4c73b?w=600",
                    "Fabric: Georgette, Color: Crimson Red, Detail: Sequin Work", "Ships in 24 hours.", seller
            ));
            products.add(createProduct(
                    "Midnight Black Net Saree",
                    "Exquisite black net saree showcasing rich threadwork, floral motifs, and a scalloped border. Includes a matching unstitched blouse piece.",
                    "Sarees", "Frais Luxe", "SKU-SAREE-04", 140.00, 125.00, 12,
                    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
                    "Fabric: Net, Color: Midnight Black, Work: Resham Threadwork", "Ships in 24 hours.", seller
            ));

            // --- CATEGORY: Salwar Kameez ---
            products.add(createProduct(
                    "Olive Green Anarkali Suit",
                    "Floor-length olive green georgette Anarkali gown with complex golden thread embroidery on the yoke and cuffs. Comes with a matching dupatta.",
                    "Salwar Kameez", "Royal Silks", "SKU-SUIT-01", 110.00, 95.00, 25,
                    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
                    "Fabric: Georgette, Style: Anarkali Gown, Sleeve: Full Sleeve", "Ships in 24 hours.", seller
            ));
            products.add(createProduct(
                    "Mustard Yellow Sharara Set",
                    "Chic mustard yellow georgette short kurti paired with a flared sharara pants and a matching floral printed organza dupatta.",
                    "Salwar Kameez", "Frais Active", "SKU-SUIT-02", 85.00, 75.00, 35,
                    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600",
                    "Fabric: Georgette & Organza, Color: Mustard Yellow, Style: Sharara Set", "Ships in 24 hours.", seller
            ));
            products.add(createProduct(
                    "Peach Georgette Palazzo Suit",
                    "Elegantly crafted peach straight-cut salwar suit with mirror work on the neckline, paired with comfortable wide-leg palazzo pants.",
                    "Salwar Kameez", "Frais Essentials", "SKU-SUIT-03", 79.99, null, 40,
                    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
                    "Fabric: Faux Georgette, Color: Soft Peach, Style: Palazzo Suit", "Ships in 24 hours.", seller
            ));
            products.add(createProduct(
                    "Lavender Silk Straight Suit",
                    "Premium lavender chanderi silk straight suit with gold foil print detailing and coordinates. Accompanied by a matching silk dupatta.",
                    "Salwar Kameez", "Royal Silks", "SKU-SUIT-04", 98.00, 89.00, 18,
                    "https://images.unsplash.com/photo-1619551186249-b7cd8c660d55?w=600",
                    "Fabric: Chanderi Silk, Color: Lavender, Style: Straight Cut", "Ships in 24 hours.", seller
            ));

            // --- CATEGORY: Lehengas ---
            products.add(createProduct(
                    "Coral Pink Mirror Lehenga",
                    "A vibrant coral pink georgette lehenga choli set heavily detailed with mirror-work, sequins, and a contrasting golden bordered dupatta.",
                    "Lehengas", "Frais Glam", "SKU-LEH-01", 299.00, 249.99, 10,
                    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
                    "Fabric: Georgette, Color: Coral Pink, Work: Real Mirror & Sequins", "Ships in 3-5 business days.", seller
            ));
            products.add(createProduct(
                    "Wine Red Velvet Lehenga",
                    "Heavy velvet bridal lehenga in rich wine red, featuring royal gold zari embroidery and hand-sewn stonework. A true heirloom piece.",
                    "Lehengas", "Frais Luxe", "SKU-LEH-02", 450.00, 399.00, 8,
                    "https://images.unsplash.com/photo-1610030470298-4c3e34b4c73b?w=600",
                    "Fabric: Premium Velvet, Color: Wine Red, Work: Heavy Zari & Stone", "Ships in 5-7 business days.", seller
            ));
            products.add(createProduct(
                    "Floral Print Organza Lehenga",
                    "A lightweight, breezy organza lehenga set featuring digital pastel floral prints, a sequin-embellished blouse, and a soft net dupatta.",
                    "Lehengas", "Frais Essentials", "SKU-LEH-03", 160.00, null, 20,
                    "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=600",
                    "Fabric: Organza, Color: Pastel Floral, Weight: Light", "Ships in 24 hours.", seller
            ));

            // --- CATEGORY: Indo Western ---
            products.add(createProduct(
                    "Lime Green Dhoti Set",
                    "A modern drape set featuring a lime green asymmetric georgette tunic paired with matching dhoti pants. Adorned with a hand-embroidered belt.",
                    "Indo Western", "Frais Active", "SKU-INDO-01", 115.00, 99.00, 15,
                    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
                    "Fabric: Georgette, Style: Dhoti & Tunic, Color: Lime Green", "Ships in 24 hours.", seller
            ));
            products.add(createProduct(
                    "Palazzo Crop Top Shrug Set",
                    "Three-piece fusion set consisting of georgette wide-leg palazzos, a matching crop top, and a flowing printed georgette cape/shrug.",
                    "Indo Western", "Frais Essentials", "SKU-INDO-02", 92.00, 85.00, 22,
                    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600",
                    "Fabric: Georgette, Style: Crop Top & Palazzo with Shrug", "Ships in 24 hours.", seller
            ));
            products.add(createProduct(
                    "Asymmetric Rose Drape Kurta",
                    "An elegant cowl-drape asymmetric kurta in dusty rose satin, detailed with a sequin cuff and matching fitted pencil pants.",
                    "Indo Western", "Frais Glam", "SKU-INDO-03", 105.00, null, 17,
                    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
                    "Fabric: Premium Satin, Color: Dusty Rose, Style: Cowl Drape Kurta", "Ships in 24 hours.", seller
            ));

            // --- CATEGORY: Men ---
            products.add(createProduct(
                    "Cream Sherwani Set",
                    "A classic cream raw-silk sherwani set with fine self-embroidery, complete with matching churidar pants and a gold tissue stole.",
                    "Men", "Heritage Weaves", "SKU-MEN-01", 240.00, 199.99, 14,
                    "https://images.unsplash.com/photo-1597983073492-bc24058ba262?w=600",
                    "Fabric: Raw Silk, Color: Cream / Off-White, Style: Groom's Sherwani", "Ships in 3-5 business days.", seller
            ));
            products.add(createProduct(
                    "Mustard Tussar Silk Kurta",
                    "A comfortable mustard yellow kurta crafted from premium Tussar silk. Features a band collar and matching cream pajama pants.",
                    "Men", "Frais Essentials", "SKU-MEN-02", 55.00, 48.00, 30,
                    "https://images.unsplash.com/photo-1597983073492-bc24058ba262?w=600",
                    "Fabric: Tussar Silk, Color: Mustard Yellow, Style: Straight Kurta", "Ships in 24 hours.", seller
            ));
            products.add(createProduct(
                    "Nehru Jacket Kurta Set",
                    "A floral printed jacquard Nehru jacket paired with a solid cream cotton-silk kurta and churidar pants. Perfect for sangeet functions.",
                    "Men", "Heritage Weaves", "SKU-MEN-03", 99.00, null, 25,
                    "https://images.unsplash.com/photo-1597983073492-bc24058ba262?w=600",
                    "Jacket Fabric: Jacquard, Kurta Fabric: Cotton Silk, Set: 3 Piece", "Ships in 24 hours.", seller
            ));

            // --- CATEGORY: Jewellery ---
            products.add(createProduct(
                    "Kundan Pearl Choker Set",
                    "A high-quality traditional Kundan choker necklace embellished with green enamel work and dropping freshwater pearls. Includes matching earrings.",
                    "Jewellery", "Frais Luxe", "SKU-JEWEL-01", 65.00, 55.00, 15,
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
                    "Material: Brass Alloy, Stone: Kundan & Faux Pearl, Plating: 22k Gold", "Ships in 24 hours.", seller
            ));
            products.add(createProduct(
                    "Temple Gold Plated Necklace",
                    "South Indian style temple jewellery long necklace depicting intricate carvings of Goddess Lakshmi, adorned with red ruby stones.",
                    "Jewellery", "Heritage Weaves", "SKU-JEWEL-02", 75.00, 68.00, 10,
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
                    "Material: Copper Base, Stone: Rubies, Detail: Laxmi Coin Design", "Ships in 24 hours.", seller
            ));
            products.add(createProduct(
                    "Antique Jhumka Earrings",
                    "Beautifully detailed antique gold-plated dome jhumkas with small hanging seed pearls. Perfect accompaniment for sarees.",
                    "Jewellery", "Frais Essentials", "SKU-JEWEL-03", 29.99, null, 50,
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
                    "Material: Alloy, Style: Hanging Jhumka, Weight: 18g", "Ships in 24 hours.", seller
            ));

            productRepository.saveAll(products);
            System.out.println("Seeded " + products.size() + " Premium Indian Ethnic Wear Products successfully!");
        }
    }

    private Product createProduct(String name, String desc, String cat, String brand, String sku,
                                   double price, Double discPrice, int stock, String image, String specs, String delivery, Seller seller) {
        List<String> images = new ArrayList<>();
        images.add(image);

        Map<String, String> specMap = new HashMap<>();
        if (specs != null && !specs.isEmpty()) {
            String[] pairs = specs.split(",");
            for (String pair : pairs) {
                String[] kv = pair.split(":");
                if (kv.length == 2) {
                    specMap.put(kv[0].trim(), kv[1].trim());
                }
            }
        }

        return Product.builder()
                .productName(name)
                .description(desc)
                .category(cat)
                .brand(brand)
                .sku(sku)
                .price(BigDecimal.valueOf(price))
                .discountPrice(discPrice != null ? BigDecimal.valueOf(discPrice) : null)
                .stockQuantity(stock)
                .productImages(images)
                .specifications(specMap)
                .deliveryInfo(delivery)
                .seller(seller)
                .ratings(4.5 + Math.random() * 0.5) // Random rating between 4.5 and 5.0
                .build();
    }
}
