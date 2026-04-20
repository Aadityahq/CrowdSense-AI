const stadiumLayout = require('../shared/stadiumLayout.json');
const { readCrowdZones, seedCrowdZonesIfEmpty, writeCrowdZones } = require('./firestoreService');

let lastSnapshot = stadiumLayout.zones.map((zone, index) => ({
  id: zone.id,
  name: zone.label,
  density: Math.max(5, Math.min(95, 20 + (index * 9) % 60)),
  queue: Math.max(1, Math.min(20, 3 + (index * 2) % 10)),
  lat: 22.57 + index * 0.001,
  lng: 88.36 + index * 0.001,
}));

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function drift(value, maxStep, min, max) {
  const step = Math.floor(Math.random() * (maxStep * 2 + 1)) - maxStep;
  return clamp(Math.round(value + step), min, max);
}

function buildCrowdSnapshot() {
  const nextSnapshot = stadiumLayout.zones.map((zone, index) => {
    const previous = lastSnapshot.find((entry) => entry.id === zone.id) || lastSnapshot[index] || {};

    return {
      id: zone.id,
      name: zone.label,
      density: drift(previous.density || 30, 4, 0, 100),
      queue: drift(previous.queue || 5, 2, 0, 25),
      lat: previous.lat || 22.57 + index * 0.001,
      lng: previous.lng || 88.36 + index * 0.001,
    };
  });

  lastSnapshot = nextSnapshot;
  return nextSnapshot;
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
