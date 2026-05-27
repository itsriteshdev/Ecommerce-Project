const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/auth');
const { AppError } = require('../middlewares/errorHandler');
const { toCustomerResponseDto, toSellerResponseDto } = require('../utils/dtoMapper');

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return next(new AppError('Invalid email or password', 401));
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate JWT token. The subject (sub) should be the email. Expiration 7 days (604800s)
    const token = jwt.sign(
      { sub: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      email: user.email,
      role: user.role,
      id: parseInt(user.id, 10)
    });
  } catch (err) {
    next(err);
  }
};

const registerCustomer = async (req, res, next) => {
  const { email, password, fullName, phoneNumber, gender, address, city, state, pincode } = req.body;

  if (!email || !password || !fullName) {
    return next(new AppError('Email, password and full name are required', 400));
  }

  try {
    // Check if email already exists
    const checkUser = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return next(new AppError('Email address already registered', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Run transaction
    const customer = await db.transaction(async (client) => {
      const userRes = await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
        [email, hashedPassword, 'ROLE_CUSTOMER']
      );
      const userId = userRes.rows[0].id;

      const customerRes = await client.query(
        `INSERT INTO customers (id, full_name, email, phone_number, gender, address, city, state, pincode, account_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [userId, fullName, email, phoneNumber || null, gender || null, address || null, city || null, state || null, pincode || null, 'ACTIVE']
      );

      await client.query(
        'INSERT INTO carts (customer_id, total_amount) VALUES ($1, $2)',
        [userId, 0.00]
      );

      return customerRes.rows[0];
    });

    res.status(201).json(toCustomerResponseDto(customer));
  } catch (err) {
    next(err);
  }
};

const registerSeller = async (req, res, next) => {
  const { email, password, sellerName, businessName, gstNumber, phoneNumber, warehouseAddress, bankDetails } = req.body;

  if (!email || !password || !sellerName || !businessName) {
    return next(new AppError('Required fields: email, password, sellerName, businessName', 400));
  }

  try {
    const checkUser = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return next(new AppError('Email address already registered', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Run transaction
    const seller = await db.transaction(async (client) => {
      const userRes = await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
        [email, hashedPassword, 'ROLE_SELLER']
      );
      const userId = userRes.rows[0].id;

      const sellerRes = await client.query(
        `INSERT INTO sellers (seller_id, seller_name, business_name, gst_number, email, phone_number, warehouse_address, bank_details, verification_status, revenue, ratings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [userId, sellerName, businessName, gstNumber || null, email, phoneNumber || null, warehouseAddress || null, bankDetails || null, 'PENDING', 0.00, 0.0]
      );

      return sellerRes.rows[0];
    });

    res.status(201).json(toSellerResponseDto(seller));
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  // Support both query param and body body
  const email = req.query.email || req.body.email;
  const newPassword = req.query.newPassword || req.body.newPassword;

  if (!email || !newPassword) {
    return next(new AppError('Email and new password are required', 400));
  }

  try {
    const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return next(new AppError('User not found with email: ' + email, 404));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2', [hashedPassword, email]);

    res.ok = true; // just for logging
    res.json('Password reset successfully'); // returns plain text response matching ResponseEntity.ok("...")
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  registerCustomer,
  registerSeller,
  forgotPassword
};
