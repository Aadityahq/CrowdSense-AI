const express = require('express');
const { getSession, updateUserRole } = require('../controllers/authController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getSession);
router.patch('/users/:uid/role', protect, requireRole('ADMIN'), updateUserRole);

module.exports = router;
