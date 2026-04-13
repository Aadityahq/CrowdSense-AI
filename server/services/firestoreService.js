const { initializeFirebaseAdmin } = require('../config/firebase');
const stadiumLayout = require('../../shared/stadiumLayout.json');

let firestore = null;

function getFirestore() {
  if (!firestore) {
    firestore = initializeFirebaseAdmin();
  }

  return firestore;
}

async function readCrowdZones() {
  const snapshot = await getFirestore().collection('crowd_zones').get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function readAlerts() {
  const snapshot = await getFirestore().collection('alerts').orderBy('createdAt', 'desc').get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function writeAlert(alert) {
  const docRef = getFirestore().collection('alerts').doc();

  const payload = {
    title: alert.title,
    description: alert.description,
    severity: alert.severity || 'medium',
    createdAt: new Date(),
  };

  await docRef.set(payload);
  return { id: docRef.id, ...payload };
}

async function seedAlertsIfEmpty(defaultAlerts = []) {
  const existing = await readAlerts();

  if (existing.length > 0) {
    return existing;
  }

  const batch = getFirestore().batch();
  const collectionRef = getFirestore().collection('alerts');

  for (const alert of defaultAlerts) {
    const docRef = alert.id ? collectionRef.doc(alert.id) : collectionRef.doc();
    batch.set(docRef, {
      title: alert.title,
      description: alert.description,
      severity: alert.severity || 'medium',
      createdAt: new Date(),
    });
  }

  await batch.commit();
  return readAlerts();
}

async function writeCrowdZones(zones = []) {
  const batch = getFirestore().batch();

  for (const zone of zones) {
    const zoneId = zone.id || zone.name?.toLowerCase().replace(/\s+/g, '_');
    const docRef = getFirestore().collection('crowd_zones').doc(zoneId);

    batch.set(
      docRef,
      {
        name: zone.name,
        lat: zone.lat,
        lng: zone.lng,
        density: Math.max(0, Math.min(100, Math.round(zone.density || 0))),
        updatedAt: new Date(),
      },
      { merge: true },
    );
  }

  await batch.commit();
}

async function seedCrowdZonesIfEmpty() {
  const existing = await readCrowdZones();

  if (existing.length > 0) {
    return existing;
  }

  const initialZones = stadiumLayout.zones.map((zone, index) => ({
    id: zone.id || `zone-${index + 1}`,
    name: zone.label,
    lat: 22.57 + index * 0.001,
    lng: 88.36 + index * 0.001,
    density: Math.floor(Math.random() * 100),
  }));

  await writeCrowdZones(initialZones);
  return initialZones;
}

module.exports = {
  getFirestore,
  readCrowdZones,
  writeCrowdZones,
  seedCrowdZonesIfEmpty,
  readAlerts,
  writeAlert,
  seedAlertsIfEmpty,
};
