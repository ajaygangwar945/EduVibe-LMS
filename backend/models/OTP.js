const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['registration', 'password_reset'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // Auto-delete document after 5 minutes (300 seconds)
    expires: 300,
  },
});

module.exports = mongoose.model('OTP', otpSchema);
