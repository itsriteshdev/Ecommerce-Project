const db = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const { toProductResponseDto, paginate } = require('../utils/dtoMapper');

const getProductImagesAndSpecs = async (productIds) => {
  if (!productIds || productIds.length === 0) return { images: {}, specs: {} };

  const imagesRes = await db.query(
    'SELECT * FROM product_images WHERE product_id = ANY($1)',
    [productIds]
  );
  const specsRes = await db.query(
    'SELECT * FROM product_specifications WHERE product_id = ANY($1)',
    [productIds]
  );

  const imagesMap = {};
  imagesRes.rows.forEach(row => {
    if (!imagesMap[row.product_id]) imagesMap[row.product_id] = [];
    imagesMap[row.product_id].push(row.image_url);
  });

  const specsMap = {};
  specsRes.rows.forEach(row => {
    if (!specsMap[row.product_id]) specsMap[row.product_id] = {};
    specsMap[row.product_id][row.spec_key] = row.spec_value;
  });

  return { images: imagesMap, specs: specsMap };
};

const getAllProducts = async (req, res, next) => {
  const page = parseInt(req.query.page || 0, 10);
  const size = parseInt(req.query.size || 12, 10);
  const offset = page * size;

  try {
    const countRes = await db.query('SELECT COUNT(*) FROM products');
    const totalElements = parseInt(countRes.rows[0].count, 10);

    const prodsRes = await db.query(
      `SELECT p.*, s.business_name 
       FROM products p 
       JOIN sellers s ON p.seller_id = s.seller_id 
       ORDER BY p.product_id 
       LIMIT $1 OFFSET $2`,
      [size, offset]
    );

    const productIds = prodsRes.rows.map(p => parseInt(p.product_id, 10));
    const { images, specs } = await getProductImagesAndSpecs(productIds);

    const content = prodsRes.rows.map(p => 
      toProductResponseDto(p, images[p.product_id] || [], specs[p.product_id] || {})
    );

    res.json(paginate(content, page, size, totalElements));
  } catch (err) {
    next(err);
  }
};

const searchProducts = async (req, res, next) => {
  const query = req.query.query || '';
  const page = parseInt(req.query.page || 0, 10);
  const size = parseInt(req.query.size || 12, 10);
  const offset = page * size;

  try {
    const likeQuery = `%${query}%`;
    const countRes = await db.query(
      `SELECT COUNT(*) FROM products p
       WHERE LOWER(p.product_name) LIKE LOWER($1) 
          OR LOWER(p.description) LIKE LOWER($1) 
          OR LOWER(p.brand) LIKE LOWER($1) 
          OR LOWER(p.category) LIKE LOWER($1)`,
      [likeQuery]
    );
    const totalElements = parseInt(countRes.rows[0].count, 10);

    const prodsRes = await db.query(
      `SELECT p.*, s.business_name 
       FROM products p 
       JOIN sellers s ON p.seller_id = s.seller_id 
       WHERE LOWER(p.product_name) LIKE LOWER($1) 
          OR LOWER(p.description) LIKE LOWER($1) 
          OR LOWER(p.brand) LIKE LOWER($1) 
          OR LOWER(p.category) LIKE LOWER($1)
       ORDER BY p.product_id 
       LIMIT $2 OFFSET $3`,
      [likeQuery, size, offset]
    );

    const productIds = prodsRes.rows.map(p => parseInt(p.product_id, 10));
    const { images, specs } = await getProductImagesAndSpecs(productIds);

    const content = prodsRes.rows.map(p => 
      toProductResponseDto(p, images[p.product_id] || [], specs[p.product_id] || {})
    );

    res.json(paginate(content, page, size, totalElements));
  } catch (err) {
    next(err);
  }
};

const filterProducts = async (req, res, next) => {
  const category = req.query.category || null;
  const brand = req.query.brand || null;
  const minPrice = req.query.minPrice || null;
  const maxPrice = req.query.maxPrice || null;
  const inStock = req.query.inStock || null;

  const page = parseInt(req.query.page || 0, 10);
  const size = parseInt(req.query.size || 12, 10);
  const offset = page * size;

  try {
    let queryText = `
      FROM products p 
      JOIN sellers s ON p.seller_id = s.seller_id 
      WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (category) {
      queryText += ` AND LOWER(p.category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }
    if (brand) {
      queryText += ` AND LOWER(p.brand) = LOWER($${paramIndex})`;
      params.push(brand);
      paramIndex++;
    }
    if (minPrice) {
      queryText += ` AND p.price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }
    if (maxPrice) {
      queryText += ` AND p.price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }
    if (inStock !== null) {
      const stockBool = inStock === 'true';
      if (stockBool) {
        queryText += ` AND p.stock_quantity > 0`;
      } else {
        queryText += ` AND p.stock_quantity = 0`;
      }
    }

    // Get count
    const countRes = await db.query(`SELECT COUNT(*) ${queryText}`, params);
    const totalElements = parseInt(countRes.rows[0].count, 10);

    // Get paginated content
    const selectQuery = `SELECT p.*, s.business_name ${queryText} ORDER BY p.product_id LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(size, offset);

    const prodsRes = await db.query(selectQuery, params);

    const productIds = prodsRes.rows.map(p => parseInt(p.product_id, 10));
    const { images, specs } = await getProductImagesAndSpecs(productIds);

    const content = prodsRes.rows.map(p => 
      toProductResponseDto(p, images[p.product_id] || [], specs[p.product_id] || {})
    );

    res.json(paginate(content, page, size, totalElements));
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const prodRes = await db.query(
      `SELECT p.*, s.business_name 
       FROM products p 
       JOIN sellers s ON p.seller_id = s.seller_id 
       WHERE p.product_id = $1`,
      [id]
    );

    if (prodRes.rows.length === 0) {
      return next(new AppError('Product not found with id: ' + id, 404));
    }

    const product = prodRes.rows[0];
    const { images, specs } = await getProductImagesAndSpecs([product.product_id]);

    res.json(toProductResponseDto(product, images[product.product_id] || [], specs[product.product_id] || {}));
  } catch (err) {
    next(err);
  }
};

const addProduct = async (req, res, next) => {
  const sellerId = req.user.id;
  const { productName, description, category, brand, sku, price, discountPrice, stockQuantity, productImages, specifications, deliveryInfo } = req.body;

  if (!productName || !category || !sku || price === undefined || stockQuantity === undefined) {
    return next(new AppError('Required fields: productName, category, sku, price, stockQuantity', 400));
  }

  try {
    // Verify SKU does not exist
    const skuCheck = await db.query('SELECT 1 FROM products WHERE sku = $1', [sku]);
    if (skuCheck.rows.length > 0) {
      return next(new AppError(`Product with SKU ${sku} already exists`, 400));
    }

    await db.query('BEGIN');

    const prodRes = await db.query(
      `INSERT INTO products (product_name, description, category, brand, sku, price, discount_price, stock_quantity, ratings, delivery_info, seller_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        productName,
        description || null,
        category,
        brand || null,
        sku,
        parseFloat(price),
        discountPrice ? parseFloat(discountPrice) : null,
        parseInt(stockQuantity, 10),
        0.0,
        deliveryInfo || null,
        sellerId
      ]
    );
    const newProduct = prodRes.rows[0];
    const productId = newProduct.product_id;

    // Insert images
    const imagesToInsert = productImages || [];
    for (const img of imagesToInsert) {
      await db.query(
        'INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)',
        [productId, img]
      );
    }

    // Insert specifications
    const specsToInsert = specifications || {};
    for (const [key, value] of Object.entries(specsToInsert)) {
      await db.query(
        'INSERT INTO product_specifications (product_id, spec_key, spec_value) VALUES ($1, $2, $3)',
        [productId, key, value]
      );
    }

    await db.query('COMMIT');

    // Retrieve seller business name
    const sellerRes = await db.query('SELECT business_name FROM sellers WHERE seller_id = $1', [sellerId]);
    newProduct.business_name = sellerRes.rows[0]?.business_name;

    res.status(201).json(toProductResponseDto(newProduct, imagesToInsert, specsToInsert));
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  const sellerId = req.user.id;
  const { id } = req.params;
  const { productName, description, category, brand, sku, price, discountPrice, stockQuantity, productImages, specifications, deliveryInfo } = req.body;

  try {
    const checkProduct = await db.query('SELECT seller_id, sku FROM products WHERE product_id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return next(new AppError('Product not found with id: ' + id, 404));
    }

    const currentProduct = checkProduct.rows[0];
    if (parseInt(currentProduct.seller_id, 10) !== sellerId) {
      return next(new AppError('You are not authorized to update this product', 403));
    }

    if (sku && sku !== currentProduct.sku) {
      const skuCheck = await db.query('SELECT 1 FROM products WHERE sku = $1 AND product_id <> $2', [sku, id]);
      if (skuCheck.rows.length > 0) {
        return next(new AppError(`Product with SKU ${sku} already exists`, 400));
      }
    }

    await db.query('BEGIN');

    const updateRes = await db.query(
      `UPDATE products 
       SET product_name = $1, description = $2, category = $3, brand = $4, sku = $5, price = $6, discount_price = $7, stock_quantity = $8, delivery_info = $9, updated_at = NOW() 
       WHERE product_id = $10 RETURNING *`,
      [
        productName,
        description || null,
        category,
        brand || null,
        sku,
        parseFloat(price),
        discountPrice ? parseFloat(discountPrice) : null,
        parseInt(stockQuantity, 10),
        deliveryInfo || null,
        id
      ]
    );
    const updatedProduct = updateRes.rows[0];

    // Update images if provided
    if (productImages) {
      await db.query('DELETE FROM product_images WHERE product_id = $1', [id]);
      for (const img of productImages) {
        await db.query('INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)', [id, img]);
      }
    }

    // Update specs if provided
    if (specifications) {
      await db.query('DELETE FROM product_specifications WHERE product_id = $1', [id]);
      for (const [key, value] of Object.entries(specifications)) {
        await db.query('INSERT INTO product_specifications (product_id, spec_key, spec_value) VALUES ($1, $2, $3)', [id, key, value]);
      }
    }

    await db.query('COMMIT');

    const sellerRes = await db.query('SELECT business_name FROM sellers WHERE seller_id = $1', [sellerId]);
    updatedProduct.business_name = sellerRes.rows[0]?.business_name;

    const { images, specs } = await getProductImagesAndSpecs([id]);
    res.json(toProductResponseDto(updatedProduct, images[id] || [], specs[id] || {}));
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  const sellerId = req.user.id;
  const { id } = req.params;

  try {
    const checkProduct = await db.query('SELECT seller_id FROM products WHERE product_id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return next(new AppError('Product not found with id: ' + id, 404));
    }

    if (parseInt(checkProduct.rows[0].seller_id, 10) !== sellerId) {
      return next(new AppError('You are not authorized to delete this product', 403));
    }

    await db.query('DELETE FROM products WHERE product_id = $1', [id]);
    res.status(204).end(); // Spring returns ResponseEntity.noContent() which translates to status 204
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  searchProducts,
  filterProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct
};
