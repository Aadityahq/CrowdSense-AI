const { initializeFirebaseAdmin } = require('../config/firebase');

const ALLOWED_ROLES = new Set(['USER', 'ORGANIZER', 'ADMIN']);

let firestore = null;

function getFirestore() {
  if (!firestore) {
    firestore = initializeFirebaseAdmin();
  }

  return firestore;
}

function getSession(req, res) {
  return res.json({
    uid: req.user?.uid || null,
    email: req.user?.email || null,
    role: req.user?.role || null,
  });
}

async function updateUserRole(req, res) {
  const uid = String(req.params.uid || '').trim();
  const nextRole = String(req.body?.role || '').trim().toUpperCase();

  if (!uid) {
    return res.status(400).json({ message: 'User uid is required' });
  }

  if (!ALLOWED_ROLES.has(nextRole)) {
    return res.status(400).json({ message: 'Invalid role. Allowed roles: USER, ORGANIZER, ADMIN' });
  }

  try {
    const usersCollection = getFirestore().collection('users');
    const userRef = usersCollection.doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: 'User profile not found for provided uid' });
    }

    await userRef.update({
      role: nextRole,
      updatedAt: new Date().toISOString(),
    });

    const updatedSnap = await userRef.get();

    return res.json({
      message: 'Role updated successfully',
      user: {
        uid,
        email: updatedSnap.data()?.email || null,
        role: updatedSnap.data()?.role || nextRole,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user role' });
  }
}

module.exports = { getSession, updateUserRole };
