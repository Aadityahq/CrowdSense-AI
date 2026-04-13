const alertService = require('../services/alertService');

async function getAlerts(req, res) {
  const alerts = await alertService.getActiveAlerts();
  res.json(alerts);
}

async function createAlert(req, res) {
  const { title, description, severity } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'title and description are required' });
  }

  const created = await alertService.createAlert({ title, description, severity });
  return res.status(201).json(created);
}

module.exports = { getAlerts, createAlert };
