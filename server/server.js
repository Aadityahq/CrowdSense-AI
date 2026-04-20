const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;
const frontendUrl = process.env.FRONTEND_URL || 'https://crowdsense-ai-b80b9.web.app';

app.use(cors());
app.use(express.json());

// Health check endpoint - always available
app.get('/', (req, res) => {
  res.status(200).send(`
    <h1>CrowdSense AI Backend Running</h1>
    <p>Frontend: <a href="${frontendUrl}" target="_blank" rel="noopener noreferrer">${frontendUrl}</a></p>
    <p>Health: OK</p>
  `);
});

// Gracefully handle missing routes if Firebase hasn't initialized yet
app.use((req, res, next) => {
  try {
    // Routes will be loaded after server starts
    next();
  } catch (err) {
    res.status(503).json({ error: 'Service initializing...' });
  }
});

// Load routes after server is listening
let routesLoaded = false;
const server = app.listen(port, () => {
  console.log(`CrowdSense AI server running on port ${port}`);

  // Load routes asynchronously after server is listening
  setImmediate(() => {
    try {
      const crowdRoutes = require('./routes/crowdRoutes');
      const routeRoutes = require('./routes/routeRoutes');
      const alertRoutes = require('./routes/alertRoutes');
      const queueRoutes = require('./routes/queueRoutes');
      const authRoutes = require('./routes/authRoutes');
      const adminRoutes = require('./routes/adminRoutes');

      app.use('/api/crowd', crowdRoutes);
      app.use('/api/routes', routeRoutes);
      app.use('/api/alerts', alertRoutes);
      app.use('/api/queues', queueRoutes);
      app.use('/api/auth', authRoutes);
      app.use('/api/admin', adminRoutes);

      routesLoaded = true;
      console.log('All routes loaded successfully');
    } catch (err) {
      console.error('Error loading routes:', err.message);
    }
  });

  // Setup Firestore auto-sync after a delay
  if (process.env.FIRESTORE_AUTO_SYNC !== 'false') {
    setTimeout(() => {
      try {
        const { syncCrowdSnapshot } = require('./services/crowdService');
        const syncIntervalMs = Number(process.env.FIRESTORE_SYNC_INTERVAL_MS || 15000);
        let firestoreSyncDisabled = false;

        setInterval(() => {
          if (firestoreSyncDisabled) return;
          syncCrowdSnapshot().catch((error) => {
            if (!firestoreSyncDisabled) {
              console.log('Firestore sync error:', error.message);
              firestoreSyncDisabled = true;
            }
          });
        }, syncIntervalMs);
      } catch (err) {
        console.error('Error setting up Firestore sync:', err.message);
      }
    }, 1000);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
