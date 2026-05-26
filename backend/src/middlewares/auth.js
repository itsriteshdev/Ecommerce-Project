const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'this-is-a-secure-and-strong-key-for-jwt-token-generation-ecommerce-backend-system';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.sub;

    // Fetch user to confirm active account and retrieve DB id
    const userResult = await db.query('SELECT id, email, role FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Access Denied: User not found' });
    }

    const user = userResult.rows[0];
    req.user = {
      id: parseInt(user.id, 10),
      email: user.email,
      role: user.role // e.g. ROLE_CUSTOMER, ROLE_SELLER, ROLE_ADMIN
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Access Denied: Invalid or Expired Token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient Permissions' });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  JWT_SECRET
};
