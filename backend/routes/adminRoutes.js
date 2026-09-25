const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { submitDocuments, getPendingProviders, approveProvider, getAllBookings } = require('../controllers/adminController');

// Provider route to submit KYC
router.post('/submit-kyc', auth, submitDocuments);

// Admin routes
router.get('/pending-providers', auth, getPendingProviders);
router.patch('/approve-provider/:id', auth, approveProvider);
router.get('/all-bookings', auth, getAllBookings);

module.exports = router;