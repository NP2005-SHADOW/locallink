const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Customer', 'Provider', 'Admin'], default: 'Customer' },
  
  // New fields for Service Providers
  category: { type: String }, // e.g., 'Household'
  service: { type: String },  // e.g., 'Electrician'
  
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  // Temporary OTP Storage Fields
  emailOtp: { type: String },
  emailOtpExpires: { type: Date },
  phoneOtp: { type: String },
  phoneOtpExpires: { type: Date },
  verificationStatus: { 
    type: String, 
    enum: ['Pending', 'Submitted', 'Approved'], 
    default: 'Pending' 
  },
  documentData: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);