const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  sendEmailOtp, 
  verifyEmailOtp, 
  sendPhoneOtp, 
  verifyPhoneOtp,
  uploadKyc // 👈 1. Import uploadKyc here
} = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware'); // 👈 2. Ensure authMiddleware is imported

// Registration (No file upload here anymore)
router.post('/register', register);
router.post('/login', login);

// Email OTP Verification
router.post('/send-otp', sendEmailOtp);
router.post('/verify-otp', verifyEmailOtp);

// Phone OTP Verification
router.post('/send-phone-otp', sendPhoneOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);

// KYC Document Upload (Multer) - Protected by authMiddleware, runs AFTER phone verification
router.post('/upload-kyc', authMiddleware, upload.single('document'), uploadKyc);

module.exports = router;