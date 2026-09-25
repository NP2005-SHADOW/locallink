const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getCustomerBookings, 
  getProviderBookings, 
  getBookingsByProviderId, 
  cancelBooking, 
  updateBookingStatus,
  addReview,
  getAllBookingsForAdmin, 
  getProviderReviews,
  completeService // <-- Added this import
} = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');

router.get('/admin/all', auth, getAllBookingsForAdmin);
router.post('/', auth, createBooking);
router.get('/customer', auth, getCustomerBookings);
router.get('/provider', auth, getProviderBookings);
router.get('/provider-slots/:providerId', getBookingsByProviderId);
router.delete('/:id', auth, cancelBooking);
router.patch('/:id/status', auth, updateBookingStatus);
router.post('/:id/review', auth, addReview);
router.get('/provider-reviews/:providerId', getProviderReviews);
router.post('/:id/complete', auth, completeService); // <-- Added the OTP completion route

module.exports = router;