const db = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const { toSellerResponseDto, toProductResponseDto } = require('../utils/dtoMapper');

const getProfile = async (req, res, next) => {
  const sellerId = req.user.id;

  try {
    const sellerRes = await db.query('SELECT * FROM sellers WHERE seller_id = $1', [sellerId]);
    if (sellerRes.rows.length === 0) {
      return next(new AppError('Seller profile not found', 404));
    }
    res.json(toSellerResponseDto(sellerRes.rows[0]));
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  const sellerId = req.user.id;
  const { sellerName, businessName, gstNumber, phoneNumber, warehouseAddress, bankDetails } = req.body;

  try {
    const sellerCheck = await db.query('SELECT * FROM sellers WHERE seller_id = $1', [sellerId]);
    if (sellerCheck.rows.length === 0) {
      return next(new AppError('Seller profile not found', 404));
    }

    const current = sellerCheck.rows[0];

    const updatedSellerName = sellerName !== undefined ? sellerName : current.seller_name;
    const updatedBusinessName = businessName !== undefined ? businessName : current.business_name;
    const updatedGstNumber = gstNumber !== undefined ? gstNumber : current.gst_number;
    const updatedPhoneNumber = phoneNumber !== undefined ? phoneNumber : current.phone_number;
    const updatedWarehouseAddress = warehouseAddress !== undefined ? warehouseAddress : current.warehouse_address;
    const updatedBankDetails = bankDetails !== undefined ? bankDetails : current.bank_details;

    const updateRes = await db.query(
      `UPDATE sellers 
       SET seller_name = $1, business_name = $2, gst_number = $3, phone_number = $4, warehouse_address = $5, bank_details = $6, updated_at = NOW() 
       WHERE seller_id = $7 RETURNING *`,
      [
        updatedSellerName,
        updatedBusinessName,
        updatedGstNumber,
        updatedPhoneNumber,
        updatedWarehouseAddress,
        updatedBankDetails,
        sellerId
      ]
    );

    res.json(toSellerResponseDto(updateRes.rows[0]));
  } catch (err) {
    next(err);
  }
};

const getDashboard = async (req, res, next) => {
  const sellerId = req.user.id;

  try {
    const sellerRes = await db.query('SELECT * FROM sellers WHERE seller_id = $1', [sellerId]);
    if (sellerRes.rows.length === 0) {
      return next(new AppError('Seller profile not found', 404));
    }
    const seller = sellerRes.rows[0];

    // Fetch orders count and total revenue
    const ordersRes = await db.query('SELECT total_amount FROM orders WHERE seller_id = $1', [sellerId]);
    const totalOrdersPlaced = ordersRes.rows.length;
    const totalRevenue = ordersRes.rows.reduce((sum, row) => sum + parseFloat(row.total_amount), 0.00);

    // Fetch product count
    const prodCountRes = await db.query('SELECT COUNT(*) FROM products WHERE seller_id = $1', [sellerId]);
    const totalProducts = parseInt(prodCountRes.rows[0].count, 10);

    // Fetch top 5 products (sorted by ratings DESC)
    const topProdsRes = await db.query(
      `SELECT p.*, s.business_name 
       FROM products p
       JOIN sellers s ON p.seller_id = s.seller_id
       WHERE p.seller_id = $1 
       ORDER BY p.ratings DESC 
       LIMIT 5`,
      [sellerId]
    );

    const topProductIds = topProdsRes.rows.map(p => parseInt(p.product_id, 10));
    
    let imagesMap = {};
    let specsMap = {};

    if (topProductIds.length > 0) {
      const imgRes = await db.query('SELECT * FROM product_images WHERE product_id = ANY($1)', [topProductIds]);
      imgRes.rows.forEach(r => {
        if (!imagesMap[r.product_id]) imagesMap[r.product_id] = [];
        imagesMap[r.product_id].push(r.image_url);
      });

      const spRes = await db.query('SELECT * FROM product_specifications WHERE product_id = ANY($1)', [topProductIds]);
      spRes.rows.forEach(r => {
        if (!specsMap[r.product_id]) specsMap[r.product_id] = {};
        specsMap[r.product_id][r.spec_key] = r.spec_value;
      });
    }

    const topProducts = topProdsRes.rows.map(p => 
      toProductResponseDto(p, imagesMap[p.product_id] || [], specsMap[p.product_id] || {})
    );

    res.json({
      sellerId: parseInt(seller.seller_id, 10),
      businessName: seller.business_name,
      totalRevenue,
      totalProducts,
      totalOrdersPlaced: parseInt(totalOrdersPlaced, 10),
      sellerRating: parseFloat(seller.ratings || 0.0),
      topProducts
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboard
};
