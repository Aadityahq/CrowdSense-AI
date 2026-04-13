const express = require('express');
const { login, signup, requestOTP, verifyOTP } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;
