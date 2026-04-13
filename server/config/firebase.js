const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }

  return admin.firestore();
}

function createFirebaseConfig() {
  return {
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  };
}

module.exports = { admin, initializeFirebaseAdmin, createFirebaseConfig };
