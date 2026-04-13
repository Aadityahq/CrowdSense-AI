const crowdService = require('../services/crowdService');

async function getCrowdData(req, res) {
  try {
    const crowd = await crowdService.getCrowdSnapshot();
    res.json(crowd);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch crowd data' });
  }
}

async function syncCrowdData(req, res) {
  try {
    const crowd = await crowdService.syncCrowdSnapshot();
    res.json({ message: 'Crowd data synced', crowd });
  } catch (error) {
    res.status(503).json({ message: 'Crowd sync unavailable', reason: error.message });
  }
}

module.exports = { getCrowdData, syncCrowdData };
