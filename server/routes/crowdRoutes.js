const express = require('express');
const { getCrowdData, syncCrowdData } = require('../controllers/crowdController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getCrowdData);
router.post('/sync', protect, requireRole('ADMIN'), syncCrowdData);

module.exports = router;
