const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/', authenticate, authorize('ROLE_CUSTOMER'), reviewController.addReview);
router.get('/product/:productId', reviewController.getProductReviews);

module.exports = router;
