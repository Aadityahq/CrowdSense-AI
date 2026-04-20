const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let serviceAccount = null;
const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = require('./serviceAccountKey.json');
}

function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const config = {
      projectId: process.env.GCP_PROJECT || 'crowdsense-ai-b80b9',
    };

    if (serviceAccount) {
      // Local development: use service account key
      config.credential = admin.credential.cert(serviceAccount);
      config.projectId = serviceAccount.project_id;
    } else {
      // Cloud Run: use Application Default Credentials
      config.credential = admin.credential.applicationDefault();
    }

    admin.initializeApp(config);
  }

  return admin.firestore();
}

function createFirebaseConfig() {
  if (serviceAccount) {
    return {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    };
  }

  return {
    projectId: process.env.GCP_PROJECT || 'crowdsense-ai-b80b9',
  };
}

module.exports = { admin, initializeFirebaseAdmin, createFirebaseConfig };
