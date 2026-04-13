const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    location: String,
    estimatedWait: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Queue', queueSchema);
