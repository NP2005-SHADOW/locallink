const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: {type: String,required: true},
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, trim: true },
  completionOtp: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);