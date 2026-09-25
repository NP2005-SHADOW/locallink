const Booking = require('../models/Booking');
const User = require('../models/User');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { providerId, service, date, timeSlot } = req.body;
    const customerId = req.user?.userId || req.user?.id || req.user?._id;

    if (!customerId) {
      return res.status(400).json({ message: 'Invalid token payload: User ID missing' });
    }

    if (!providerId || !timeSlot || !date) {
      return res.status(400).json({ message: 'Provider ID, Date, and Time Slot are required.' });
    }

    // SECURITY CHECK: Only block if the slot is already CONFIRMED by the provider
    const existingBooking = await Booking.findOne({ 
      provider: providerId, 
      date: date, 
      timeSlot: timeSlot,
      status: 'Confirmed' 
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already confirmed and booked. Please choose another.' });
    }

    const newBooking = new Booking({
      customer: customerId,
      provider: providerId,
      service,
      date,
      timeSlot,
      status: 'Pending' // Starts as pending, allowing requests until confirmed
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking request sent successfully', booking: newBooking });
  } catch (error) {
    console.error('Detailed Booking Error:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

// Get bookings for the logged-in customer
exports.getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user?.userId || req.user?.id || req.user?._id;
    const bookings = await Booking.find({ customer: customerId }).populate('provider', 'fullName email phone category service');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// Get bookings for the logged-in service provider
exports.getProviderBookings = async (req, res) => {
  try {
    const providerId = req.user?.userId || req.user?.id || req.user?._id;
    
    const provider = await User.findById(providerId);
    if (provider.role === 'Provider' && provider.verificationStatus !== 'Approved') {
      return res.status(403).json({ message: 'Account pending admin verification.' });
    }

    const bookings = await Booking.find({ provider: providerId }).populate('customer', 'fullName email phone');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching provider bookings', error: error.message });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.userId || req.user?.id || req.user?._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customer.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    await Booking.findByIdAndDelete(bookingId);
    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update booking status (for providers)
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body; // e.g., 'Confirmed', 'Cancelled'
    const providerId = req.user?.userId || req.user?.id || req.user?._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const dbProviderId = booking.provider._id 
      ? booking.provider._id.toString() 
      : booking.provider.toString();

    if (dbProviderId !== providerId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Generate a 6-digit OTP when confirming the booking
    if (status === 'Confirmed' && booking.status !== 'Confirmed') {
      booking.completionOtp = Math.floor(100000 + Math.random() * 900000).toString();
    }

    booking.status = status;
    await booking.save();
    
    res.status(200).json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error("CRASH IN UPDATE STATUS:", error); 
    res.status(500).json({ message: error.message || 'Server error while updating' });
  }
};

exports.addReview = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { rating, review } = req.body;
    const customerId = req.user?.userId || req.user?.id || req.user?._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'A valid rating between 1 and 5 is required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.customer.toString() !== customerId) {
      return res.status(403).json({ message: 'Not authorized to review this booking.' });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'You can only review completed services.' });
    }

    booking.rating = rating;
    booking.review = review;
    await booking.save();

    res.status(200).json({ message: 'Review submitted successfully!', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
};

// Get active bookings for a specific provider (Only CONFIRMED slots block availability)
exports.getBookingsByProviderId = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    // Only return Confirmed bookings so Pending requests leave slots green/available
    const bookings = await Booking.find({ 
      provider: providerId,
      status: 'Confirmed' 
    }).select('date timeSlot status');

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching provider availability', error: error.message });
  }
};

// Get all bookings across the platform (Admin only)
exports.getAllBookingsForAdmin = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const bookings = await Booking.find({})
      .populate('customer', 'fullName email phone')
      .populate('provider', 'fullName email phone service');
      
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all bookings', error: error.message });
  }
};

// Get all reviews and average rating for a specific provider
exports.getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Fetch all bookings for this provider that have a rating submitted
    const reviews = await Booking.find({ 
      provider: providerId, 
      rating: { $exists: true, $ne: null } 
    }).populate('customer', 'fullName');

    // Calculate the average rating score
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = (sum / reviews.length).toFixed(1);
    }

    res.status(200).json({
      averageRating,
      totalReviews: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching provider reviews', error: error.message });
  }
};

// Verify OTP and complete the service
exports.completeService = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { otp } = req.body;
    const providerId = req.user?.userId || req.user?.id || req.user?._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const dbProviderId = booking.provider._id 
      ? booking.provider._id.toString() 
      : booking.provider.toString();

    if (dbProviderId !== providerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Booking must be confirmed before it can be completed.' });
    }

    // Check if the provided OTP matches the one generated in the database
    if (booking.completionOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please check with the customer.' });
    }

    booking.status = 'Completed';
    await booking.save();

    res.status(200).json({ message: 'Service completed successfully!', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error while completing service', error: error.message });
  }
};