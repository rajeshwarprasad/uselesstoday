const express = require("express");
const { register, login, me, updateProfile, forgotPassword, resetPassword, changePassword, deleteAccount } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const verifyTurnstile = require("../middleware/verifyTurnstile");
const { authLimiter, forgotPasswordLimiter } = require("../middleware/rateLimiter");
const xssSanitize = require("../middleware/xssSanitize");

const router = express.Router();

router.post("/register", xssSanitize, verifyTurnstile, authLimiter, register);
router.post("/login", xssSanitize, verifyTurnstile, authLimiter, login);
router.post("/forgot-password", xssSanitize, verifyTurnstile, forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", xssSanitize, authLimiter, resetPassword);
router.post("/change-password", requireAuth, xssSanitize, changePassword);
router.delete("/me", requireAuth, xssSanitize, deleteAccount);
router.get("/me", requireAuth, me);
router.put("/me", requireAuth, xssSanitize, updateProfile);

module.exports = router;
