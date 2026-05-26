const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate, authorize('ROLE_CUSTOMER'));

router.get('/profile', customerController.getProfile);
router.put('/profile', customerController.updateProfile);
router.post('/wishlist/:productId', customerController.addToWishlist);
router.delete('/wishlist/:productId', customerController.removeFromWishlist);
router.get('/wishlist', customerController.getWishlist);

module.exports = router;
