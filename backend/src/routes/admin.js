const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate, authorize('ROLE_ADMIN'));

router.get('/sellers', adminController.getAllSellers);
router.put('/sellers/:sellerId/verify', adminController.verifySeller);
router.post('/coupons', adminController.createCoupon);
router.get('/coupons', adminController.getAllCoupons);
router.delete('/coupons/:couponId', adminController.deleteCoupon);

// Custom Dashboard Overhaul Endpoints
router.get('/metrics', adminController.getAdminDashboardMetrics);
router.get('/orders', adminController.getAllOrders);
router.get('/products', adminController.getAllProducts);
router.delete('/products/:productId', adminController.deleteProductAdmin);
router.get('/customers', adminController.getAllCustomers);
router.put('/customers/:customerId/status', adminController.toggleCustomerStatus);
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:reviewId', adminController.deleteReview);
router.get('/categories', adminController.getCategoriesStats);

module.exports = router;
