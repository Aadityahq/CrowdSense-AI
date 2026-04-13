const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP } = require('../utils/generateOtp');
const { sendOTP } = require('../utils/sendOtp');

const demoUsers = new Map();

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function buildToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'crowdsense_dev_secret',
    { expiresIn: '1d' },
  );
}

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function sendOtpForUser(user) {
  const otp = generateOTP();
  user.otp = hashOtp(otp);
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  await sendOTP(user.email, otp);
}

async function signup(req, res) {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Name, email, and role are required' });
  }

  if (process.env.MONGODB_URI) {
    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'User already exists. Use login.' });
      }

      const user = await User.create({ name, email, role });
      await sendOtpForUser(user);
      await user.save();

      return res.json({ message: 'OTP sent to email for signup verification' });
    } catch (error) {
      return res.status(500).json({ message: 'Signup OTP request failed' });
    }
  }

  if (demoUsers.has(email)) {
    return res.status(409).json({ message: 'User already exists. Use login.' });
  }

  const user = {
    _id: `demo-${email}`,
    name,
    email,
    role,
    otp: null,
    otpExpiry: null,
  };

  await sendOtpForUser(user);
  demoUsers.set(email, user);

  return res.json({ message: 'OTP sent to email for signup verification' });
}

async function login(req, res) {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role are required' });
  }

  if (process.env.MONGODB_URI) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found. Sign up first.' });
      }

      if (user.role !== role) {
        return res.status(403).json({ message: 'Selected role does not match user role' });
      }

      await sendOtpForUser(user);
      await user.save();
      return res.json({ message: 'OTP sent to email for login verification' });
    } catch (error) {
      return res.status(500).json({ message: 'Login OTP request failed' });
    }
  }

  const user = demoUsers.get(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found. Sign up first.' });
  }

  if (user.role !== role) {
    return res.status(403).json({ message: 'Selected role does not match user role' });
  }

  await sendOtpForUser(user);
  demoUsers.set(email, user);

  return res.json({ message: 'OTP sent to email for login verification' });
}

async function requestOTP(req, res) {
  const { mode } = req.body;
  if (mode === 'signup') {
    return signup(req, res);
  }

  return login(req, res);
}

async function verifyOTP(req, res) {
  const { email, otp, role } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const otpHash = hashOtp(otp);

  if (process.env.MONGODB_URI) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (role && user.role !== role) {
        return res.status(403).json({ message: 'Selected role does not match user role' });
      }

      if (!user.otp || user.otp !== otpHash) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      if (!user.otpExpiry || new Date(user.otpExpiry).getTime() < Date.now()) {
        return res.status(400).json({ message: 'OTP expired' });
      }

      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      const token = buildToken(user);
      return res.json({ token, user: formatUser(user) });
    } catch (error) {
      return res.status(500).json({ message: 'OTP verification failed' });
    }
  }

  const user = demoUsers.get(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (role && user.role !== role) {
    return res.status(403).json({ message: 'Selected role does not match user role' });
  }

  if (!user.otp || user.otp !== otpHash) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (!user.otpExpiry || new Date(user.otpExpiry).getTime() < Date.now()) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  user.otp = null;
  user.otpExpiry = null;
  demoUsers.set(email, user);

  const token = buildToken(user);
  return res.json({ token, user: formatUser(user) });
}

module.exports = { signup, login, requestOTP, verifyOTP };
