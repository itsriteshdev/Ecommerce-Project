const db = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const { toReviewResponseDto } = require('../utils/dtoMapper');

const addReview = async (req, res, next) => {
  const customerId = req.user.id;
  const { productId, rating, comment } = req.body;

  if (!productId || rating === undefined) {
    return next(new AppError('Required fields: productId, rating', 400));
  }

  try {
    // Check if product exists
    const prodRes = await db.query('SELECT seller_id FROM products WHERE product_id = $1', [productId]);
    if (prodRes.rows.length === 0) {
      return next(new AppError('Product not found with id: ' + productId, 404));
    }
    const sellerId = prodRes.rows[0].seller_id;

    await db.query('BEGIN');

    // Insert review
    const reviewRes = await db.query(
      `INSERT INTO reviews (customer_id, product_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [customerId, productId, parseFloat(rating), comment || null]
    );
    const newReview = reviewRes.rows[0];

    // Recalculate average rating of the product
    const prodRatingRes = await db.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = $1',
      [productId]
    );
    const avgProductRating = parseFloat(prodRatingRes.rows[0].avg_rating || 0.0);
    await db.query('UPDATE products SET ratings = $1 WHERE product_id = $2', [avgProductRating, productId]);

    // Recalculate average rating of the seller
    const sellerRatingRes = await db.query(
      `SELECT AVG(p.ratings) as avg_rating 
       FROM products p 
       WHERE p.seller_id = $1 AND p.ratings > 0`,
      [sellerId]
    );
    const avgSellerRating = parseFloat(sellerRatingRes.rows[0].avg_rating || 0.0);
    await db.query('UPDATE sellers SET ratings = $1 WHERE seller_id = $2', [avgSellerRating, sellerId]);

    await db.query('COMMIT');

    // Fetch customer name for the DTO
    const custRes = await db.query('SELECT full_name FROM customers WHERE id = $1', [customerId]);
    newReview.customer_name = custRes.rows[0]?.full_name;

    res.status(201).json(toReviewResponseDto(newReview));
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

const getProductReviews = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const checkProduct = await db.query('SELECT 1 FROM products WHERE product_id = $1', [productId]);
    if (checkProduct.rows.length === 0) {
      return next(new AppError('Product not found with id: ' + productId, 404));
    }

    const reviewsRes = await db.query(
      `SELECT r.*, c.full_name as customer_name 
       FROM reviews r 
       JOIN customers c ON r.customer_id = c.id 
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const result = reviewsRes.rows.map(toReviewResponseDto);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addReview,
  getProductReviews
};
