const { admin, initializeFirebaseAdmin } = require('../config/firebase');

let firestore = null;

function getFirestore() {
  if (!firestore) {
    firestore = initializeFirebaseAdmin();
  }

  return firestore;
}

async function resolveUserProfile(decodedToken) {
  async function toProfileFromSnapshot(snapshot) {
    if (!snapshot.exists) {
      return null;
    }

    const userData = snapshot.data() || {};
    return {
      email: typeof userData.email === 'string' && userData.email.trim() ? userData.email.trim() : null,
      role: typeof userData.role === 'string' && userData.role.trim() ? userData.role.trim().toUpperCase() : null,
    };
  }

  try {
    const usersCollection = getFirestore().collection('users');

    const uidDoc = await usersCollection.doc(decodedToken.uid).get();
    const uidProfile = await toProfileFromSnapshot(uidDoc);
    if (uidProfile) {
      return uidProfile;
    }

    // Backward compatibility for historical email-keyed user documents.
    const email = typeof decodedToken.email === 'string' ? decodedToken.email.trim() : '';
    if (email) {
      const legacyDoc = await usersCollection.doc(email).get();
      const legacyProfile = await toProfileFromSnapshot(legacyDoc);
      if (legacyProfile) {
        return legacyProfile;
      }
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

