const { admin, initializeFirebaseAdmin } = require('../config/firebase');

let firestore = null;

function getFirestore() {
  if (!firestore) {
    firestore = initializeFirebaseAdmin();
  }

  return firestore;
}

async function resolveUserProfile(decodedToken) {
  try {
    const userDoc = await getFirestore().collection('users').doc(decodedToken.uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data() || {};

      return {
        email: typeof userData.email === 'string' && userData.email.trim() ? userData.email.trim() : null,
        role: typeof userData.role === 'string' && userData.role.trim() ? userData.role.trim().toUpperCase() : null,
      };
    }
  } catch (error) {
    return {
      email: null,
      role: null,
    };
  }

  return {
    email: null,
    role: null,
  };
}

async function protect(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const profile = await resolveUserProfile(decoded);

    req.user = {
      uid: decoded.uid,
      email: profile.email,
      role: profile.role || null,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    const expectedRole = String(role || '').toUpperCase();
    const currentRole = String(req.user?.role || '').toUpperCase();

    if (!currentRole || currentRole !== expectedRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}

module.exports = { protect, requireRole };

