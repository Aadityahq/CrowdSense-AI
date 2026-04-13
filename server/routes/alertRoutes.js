const express = require('express');
const { getAlerts, createAlert } = require('../controllers/alertController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAlerts);
router.post('/', protect, requireRole('ADMIN'), createAlert);

module.exports = router;
