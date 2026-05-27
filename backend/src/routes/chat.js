const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Chatbot messages are open to all users (anonymous and registered)
router.post('/', chatController.sendMessage);

module.exports = router;
