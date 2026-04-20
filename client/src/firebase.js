import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

function isConfigured(value) {
  if (!value) return false;

  const trimmed = String(value).trim();

  if (!trimmed) return false;
  if (trimmed.startsWith('YOUR_')) return false;
  if (trimmed.startsWith('REPLACE_WITH_')) return false;

  return true;
}

const hasFirebaseConfig = Boolean(
  isConfigured(import.meta.env.VITE_FIREBASE_API_KEY) &&
  isConfigured(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) &&
  isConfigured(import.meta.env.VITE_FIREBASE_PROJECT_ID) &&
  isConfigured(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) &&
  isConfigured(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) &&
  isConfigured(import.meta.env.VITE_FIREBASE_APP_ID),
);

let db = null;
let auth = null;

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db, hasFirebaseConfig };
