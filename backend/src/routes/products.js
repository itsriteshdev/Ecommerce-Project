const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/auth');

// Public endpoints
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/filter', productController.filterProducts);
router.get('/:id', productController.getProduct);

// Protected endpoints (Seller only)
router.post('/', authenticate, authorize('ROLE_SELLER'), productController.addProduct);
router.put('/:id', authenticate, authorize('ROLE_SELLER'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('ROLE_SELLER'), productController.deleteProduct);

module.exports = router;
