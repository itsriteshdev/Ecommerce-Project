const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate, authorize } = require('../middlewares/auth');

// All cart operations require authentication and CUSTOMER role
router.use(authenticate, authorize('ROLE_CUSTOMER'));

router.get('/', cartController.getCart);
router.post('/items', cartController.addItemToCart);
router.put('/items/:cartItemId', cartController.updateItemQuantity);
router.delete('/items/:cartItemId', cartController.removeItemFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
