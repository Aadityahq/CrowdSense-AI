const express = require('express');
const { getSession } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getSession);

module.exports = router;
