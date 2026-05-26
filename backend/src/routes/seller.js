const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate, authorize('ROLE_SELLER'));

router.get('/profile', sellerController.getProfile);
router.put('/profile', sellerController.updateProfile);
router.get('/dashboard', sellerController.getDashboard);

module.exports = router;
