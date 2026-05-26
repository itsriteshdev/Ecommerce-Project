const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/auth');

// All order endpoints require authentication
router.use(authenticate);

router.post('/place', authorize('ROLE_CUSTOMER'), orderController.placeOrders);
router.get('/customer', authorize('ROLE_CUSTOMER'), orderController.getCustomerOrders);
router.get('/seller', authorize('ROLE_SELLER'), orderController.getSellerOrders);
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId/status', authorize('ROLE_SELLER', 'ROLE_ADMIN'), orderController.updateOrderStatus);
router.post('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;
