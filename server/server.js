const express = require('express');
const cors = require('cors');
require('dotenv').config();

const crowdRoutes = require('./routes/crowdRoutes');
const routeRoutes = require('./routes/routeRoutes');
const alertRoutes = require('./routes/alertRoutes');
const queueRoutes = require('./routes/queueRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { syncCrowdSnapshot } = require('./services/crowdService');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'CrowdSense AI API is running' });
});

app.use('/api/crowd', crowdRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

if (process.env.FIRESTORE_AUTO_SYNC !== 'false') {
  const syncIntervalMs = Number(process.env.FIRESTORE_SYNC_INTERVAL_MS || 15000);
  let firestoreSyncDisabled = false;
  let firestoreSyncNoticeLogged = false;

  function handleFirestoreSyncError(error) {
    const message = error?.message || '';

    if (!firestoreSyncNoticeLogged) {
      console.log('Firestore auto-sync disabled:', message);
      firestoreSyncNoticeLogged = true;
    }

    if (message.includes('PERMISSION_DENIED') || message.includes('Cloud Firestore API has not been used')) {
      firestoreSyncDisabled = true;
    }
  }

  setInterval(() => {
    if (firestoreSyncDisabled) {
      return;
    }

    syncCrowdSnapshot().catch((error) => {
      handleFirestoreSyncError(error);
    });
  }, syncIntervalMs);
}

app.listen(port, () => {
  console.log(`CrowdSense AI server running on port ${port}`);
});
