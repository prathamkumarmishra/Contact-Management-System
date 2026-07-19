const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator
} = require('../validators/authValidator');

const router = express.Router();

// Apply auth rate limiting to public authentication routes
router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Email Verification
router.post('/verify-email', authLimiter, verifyOtpValidator, validate, authController.verifyEmail);

// Password Reset Flows
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/verify-otp', authLimiter, verifyOtpValidator, validate, authController.verifyForgotPasswordOtp);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, authController.resetPassword);

// Profile detail (Protected)
router.get('/me', protect, authController.getMe);

// Profile update (Protected)
router.put('/profile', protect, authController.updateProfile);

// Change Password (Protected)
router.put('/change-password', protect, authController.changePassword);

// Delete Account (Protected)
router.delete('/account', protect, authController.deleteAccount);

module.exports = router;
