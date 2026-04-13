const stadiumLayout = require('../../shared/stadiumLayout.json');
const { readCrowdZones, seedCrowdZonesIfEmpty, writeCrowdZones } = require('./firestoreService');

function buildCrowdSnapshot() {
  return stadiumLayout.zones.map((zone) => ({
    id: zone.id,
    name: zone.label,
    density: Math.floor(Math.random() * 100),
    queue: Math.floor(Math.random() * 25),
    lat: 22.57 + Math.random() * 0.01,
    lng: 88.36 + Math.random() * 0.01,
  }));
}

async function getCrowdSnapshot() {
  try {
    const firestoreZones = await seedCrowdZonesIfEmpty();

    return firestoreZones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      lat: zone.lat,
      lng: zone.lng,
      density: Math.round(zone.density || 0),
      queue: Math.max(0, Math.round((zone.density || 0) / 4)),
    }));
  } catch (error) {
    return buildCrowdSnapshot();
  }
}

function getQueueTimes() {
  return stadiumLayout.zones.map((zone) => ({
    id: zone.id,
    location: zone.label,
    estimatedWait: Math.floor(Math.random() * 20) + 2,
  }));
}

async function syncCrowdSnapshot() {
  const snapshot = buildCrowdSnapshot();
  await writeCrowdZones(snapshot);
  return snapshot;
}

module.exports = { getCrowdSnapshot, getQueueTimes, syncCrowdSnapshot };
