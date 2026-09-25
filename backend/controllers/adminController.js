const User = require('../models/User');
const Booking = require('../models/Booking');

// For Providers: Submit Documents
exports.submitDocuments = async (req, res) => {
  try {
    const { documentData } = req.body;
    const providerId = req.user.userId;

    const provider = await User.findByIdAndUpdate(
      providerId,
      { documentData, verificationStatus: 'Submitted' },
      { new: true }
    );
    
    res.status(200).json({ message: 'Documents submitted successfully', provider });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting documents', error: error.message });
  }
};

// For Admins: Get pending providers
exports.getPendingProviders = async (req, res) => {
  try {
    // Ensure only admins can access
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });

    const providers = await User.find({ role: 'Provider', verificationStatus: 'Submitted' });
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching providers', error: error.message });
  }
};

// For Admins: Approve Provider
exports.approveProvider = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });

    const provider = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'Approved' },
      { new: true }
    );
    res.status(200).json({ message: 'Provider approved', provider });
  } catch (error) {
    res.status(500).json({ message: 'Error approving provider', error: error.message });
  }
};

// For Admins: Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });

    const bookings = await Booking.find()
      .populate('customer', 'fullName email')
      .populate('provider', 'fullName email');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};