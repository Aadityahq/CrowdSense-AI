const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('MONGODB_URI not set, skipping database connection');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB connection skipped:', error.message);
  }
}

module.exports = { connectDatabase };
