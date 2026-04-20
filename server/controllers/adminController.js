const { initializeFirebaseAdmin } = require('../config/firebase');

let firestore = null;

function getFirestore() {
  if (!firestore) {
    firestore = initializeFirebaseAdmin();
  }

  return firestore;
}

async function makeAdmin(req, res) {
  const requesterUid = String(req.user?.uid || '').trim();
  const targetUid = String(req.body?.uid || '').trim();

  if (!requesterUid) {
    return res.status(401).json({ message: 'Unauthorized requester' });
  }

  if (!targetUid) {
    return res.status(400).json({ message: 'UID required' });
  }

  try {
    const usersCollection = getFirestore().collection('users');
    const requesterSnap = await usersCollection.doc(requesterUid).get();

    if (!requesterSnap.exists || String(requesterSnap.data()?.role || '').trim().toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const targetRef = usersCollection.doc(targetUid);
    const targetSnap = await targetRef.get();

    if (!targetSnap.exists) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    await targetRef.update({
      role: 'ADMIN',
      updatedAt: new Date().toISOString(),
    });

    return res.json({ message: 'User promoted to ADMIN' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to promote user to ADMIN' });
  }
}

module.exports = { makeAdmin };
