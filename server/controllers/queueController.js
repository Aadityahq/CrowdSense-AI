const crowdService = require('../services/crowdService');

function getQueues(req, res) {
  res.json(crowdService.getQueueTimes());
}

module.exports = { getQueues };
