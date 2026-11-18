const express = require("express");
const router = express.Router();
const { getAllUsers, searchUsers, updateProfile, getUserById } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
router.get("/", protect, getAllUsers);
router.get("/search", protect, searchUsers);
router.put("/profile", protect, updateProfile);
router.get("/:userId", protect, getUserById);
module.exports = router;