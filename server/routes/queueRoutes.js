const express = require('express');
const { getQueues } = require('../controllers/queueController');

const router = express.Router();

router.get('/', getQueues);

module.exports = router;
