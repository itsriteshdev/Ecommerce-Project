const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register/customer', authController.registerCustomer);
router.post('/register/seller', authController.registerSeller);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;
