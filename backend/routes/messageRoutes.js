const express = require("express");
const router = express.Router();

const { sendMessage, getConversation } = require('../controllers/messageController');
const protect = require('../middleware/authMiddleware');
router.post("/send", protect, sendMessage);
router.get("/conversation/:userId", protect, getConversation)
module.exports = router;