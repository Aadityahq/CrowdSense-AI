const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'User' },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['USER', 'ADMIN', 'ORGANIZER'],
      default: 'USER',
    },
    otp: String,
    otpExpiry: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
