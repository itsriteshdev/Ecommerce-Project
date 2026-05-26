const db = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const { toCustomerResponseDto, toProductResponseDto } = require('../utils/dtoMapper');

const getProfile = async (req, res, next) => {
  const customerId = req.user.id;

  try {
    const custRes = await db.query('SELECT * FROM customers WHERE id = $1', [customerId]);
    if (custRes.rows.length === 0) {
      return next(new AppError('Customer profile not found', 404));
    }
    res.json(toCustomerResponseDto(custRes.rows[0]));
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  const customerId = req.user.id;
  const { fullName, phoneNumber, profileImage, gender, address, city, state, pincode } = req.body;

  try {
    const custCheck = await db.query('SELECT * FROM customers WHERE id = $1', [customerId]);
    if (custCheck.rows.length === 0) {
      return next(new AppError('Customer profile not found', 404));
    }

    const current = custCheck.rows[0];

    const updatedFullName = fullName !== undefined ? fullName : current.full_name;
    const updatedPhoneNumber = phoneNumber !== undefined ? phoneNumber : current.phone_number;
    const updatedProfileImage = profileImage !== undefined ? profileImage : current.profile_image;
    const updatedGender = gender !== undefined ? gender : current.gender;
    const updatedAddress = address !== undefined ? address : current.address;
    const updatedCity = city !== undefined ? city : current.city;
    const updatedState = state !== undefined ? state : current.state;
    const updatedPincode = pincode !== undefined ? pincode : current.pincode;

    const updateRes = await db.query(
      `UPDATE customers 
       SET full_name = $1, phone_number = $2, profile_image = $3, gender = $4, address = $5, city = $6, state = $7, pincode = $8, updated_at = NOW() 
       WHERE id = $9 RETURNING *`,
      [
        updatedFullName,
        updatedPhoneNumber,
        updatedProfileImage,
        updatedGender,
        updatedAddress,
        updatedCity,
        updatedState,
        updatedPincode,
        customerId
      ]
    );

    res.json(toCustomerResponseDto(updateRes.rows[0]));
  } catch (err) {
    next(err);
  }
};

const addToWishlist = async (req, res, next) => {
  const customerId = req.user.id;
  const { productId } = req.params;

  try {
    // Verify product exists
    const prodRes = await db.query('SELECT 1 FROM products WHERE product_id = $1', [productId]);
    if (prodRes.rows.length === 0) {
      return next(new AppError('Product not found with id: ' + productId, 404));
    }

    // Check if already in wishlist
    const wishCheck = await db.query(
      'SELECT 1 FROM customer_wishlist WHERE customer_id = $1 AND product_id = $2',
      [customerId, productId]
    );

    if (wishCheck.rows.length === 0) {
      await db.query(
        'INSERT INTO customer_wishlist (customer_id, product_id) VALUES ($1, $2)',
        [customerId, productId]
      );
    }

    res.json('Product added to wishlist successfully');
  } catch (err) {
    next(err);
  }
};

const removeFromWishlist = async (req, res, next) => {
  const customerId = req.user.id;
  const { productId } = req.params;

  try {
    await db.query(
      'DELETE FROM customer_wishlist WHERE customer_id = $1 AND product_id = $2',
      [customerId, productId]
    );
    res.json('Product removed from wishlist successfully');
  } catch (err) {
    next(err);
  }
};

const getWishlist = async (req, res, next) => {
  const customerId = req.user.id;

  try {
    const listRes = await db.query(
      `SELECT p.*, s.business_name 
       FROM customer_wishlist cw
       JOIN products p ON cw.product_id = p.product_id
       JOIN sellers s ON p.seller_id = s.seller_id
       WHERE cw.customer_id = $1`,
      [customerId]
    );

    const productIds = listRes.rows.map(p => parseInt(p.product_id, 10));
    
    let imagesMap = {};
    let specsMap = {};

    if (productIds.length > 0) {
      const imgRes = await db.query('SELECT * FROM product_images WHERE product_id = ANY($1)', [productIds]);
      imgRes.rows.forEach(r => {
        if (!imagesMap[r.product_id]) imagesMap[r.product_id] = [];
        imagesMap[r.product_id].push(r.image_url);
      });

      const spRes = await db.query('SELECT * FROM product_specifications WHERE product_id = ANY($1)', [productIds]);
      spRes.rows.forEach(r => {
        if (!specsMap[r.product_id]) specsMap[r.product_id] = {};
        specsMap[r.product_id][r.spec_key] = r.spec_value;
      });
    }

    const result = listRes.rows.map(p => 
      toProductResponseDto(p, imagesMap[p.product_id] || [], specsMap[p.product_id] || {})
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addToWishlist,
  removeFromWishlist,
  getWishlist
};
