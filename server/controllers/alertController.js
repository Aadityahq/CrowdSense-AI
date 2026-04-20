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

async function requestEmergencyAssistance(req, res) {
  const { startZone, destinationId, routeLabel } = req.body || {};
  const userRole = req.user?.role || 'USER';
  const userEmail = req.user?.email || 'unknown-user';

  const created = await alertService.createAlert({
    title: 'Emergency assistance requested',
    description: `Requester: ${userEmail} (${userRole}). Start zone: ${startZone || 'unknown'}. Suggested exit: ${destinationId || 'E1'}. Route: ${routeLabel || 'A1 -> E1'}.`,
    severity: 'high',
  });

  return res.status(201).json(created);
}

module.exports = { getAlerts, createAlert, requestEmergencyAssistance };
