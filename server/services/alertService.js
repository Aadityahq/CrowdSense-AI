const { readAlerts, writeAlert, seedAlertsIfEmpty } = require('./firestoreService');

const alerts = [
  {
    id: 'alert-1',
    title: 'Gate 2 is busy',
    description: 'Use Gate 1 for faster entry.',
    severity: 'high',
  },
  {
    id: 'alert-2',
    title: 'Food Court Delay',
    description: 'Right-side counters are currently faster.',
    severity: 'medium',
  },
  {
    id: 'alert-3',
    title: 'Emergency exits clear',
    description: 'North Exit remains the safest evacuation option.',
    severity: 'low',
  },
];

async function getActiveAlerts() {
  try {
    const firestoreAlerts = await seedAlertsIfEmpty(alerts);
    return firestoreAlerts;
  } catch (error) {
    return alerts;
  }
}

async function createAlert(payload) {
  const alert = {
    title: payload.title,
    description: payload.description,
    severity: payload.severity || 'medium',
  };

  try {
    return await writeAlert(alert);
  } catch (error) {
    const fallback = {
      id: `alert-${alerts.length + 1}`,
      ...alert,
    };

    alerts.unshift(fallback);
    return fallback;
  }
}

module.exports = { getActiveAlerts, createAlert };
