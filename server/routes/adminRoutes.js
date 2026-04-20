const express = require('express');
const { makeAdmin } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/make-admin', protect, makeAdmin);

module.exports = router;
