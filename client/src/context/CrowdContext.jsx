import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { stadiumZones } from '../data/stadium';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../firebase';

const CrowdContext = createContext(null);

function toFiniteNumber(value, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampDensity(value) {
  const density = toFiniteNumber(value, Math.floor(Math.random() * 100));
  return Math.max(0, Math.min(100, Math.round(density)));
}

function normalizeQueue(value, zoneType = 'seat', fallbackDensity = 0) {
  const fallbackQueue = zoneType === 'service'
    ? Math.floor(Math.random() * 24) + 2
    : Math.floor(Math.random() * 10);

  const parsedQueue = toFiniteNumber(value, NaN);
  if (Number.isFinite(parsedQueue)) {
    return Math.max(0, Math.round(parsedQueue));
  }

  return Math.max(0, Math.round(fallbackDensity / 4)) || fallbackQueue;
}

function buildSnapshot() {
  return stadiumZones.map((zone) => ({
    ...zone,
    density: Math.max(5, Math.min(95, 30 + (zone.capacity % 40))),
    queue: zone.type === 'service' ? Math.max(2, Math.min(24, Math.round(zone.capacity / 25))) : Math.max(1, Math.min(10, Math.round(zone.capacity / 100))),
  }));
}

function mergeWithStadiumZones(liveZones = []) {
  const liveById = new Map(liveZones.map((zone) => [zone.id, zone]));

  return stadiumZones.map((zone) => {
    const live = liveById.get(zone.id);

    return {
      ...zone,
      density: clampDensity(live?.density),
      queue: normalizeQueue(live?.queue, zone.type, clampDensity(live?.density)),
    };
  });
}

function mapFirestoreZones(snapshotZones = []) {
  const zonesById = new Map();

  for (const zone of snapshotZones) {
    const id = zone.id || zone.name?.toLowerCase().replace(/\s+/g, '_');
    zonesById.set(id, {
      id,
      name: zone.name || 'Zone',
      lat: zone.lat,
      lng: zone.lng,
      density: clampDensity(zone.density),
      queue: normalizeQueue(zone.queue, zone.type, clampDensity(zone.density)),
      updatedAt: zone.updatedAt || null,
    });
  }

  return stadiumZones.map((zone) => {
    const firestoreZone = zonesById.get(zone.id);

    if (!firestoreZone) {
      return zone;
    }

    return {
      ...zone,
      ...firestoreZone,
    };
  });
}

export function CrowdProvider({ children }) {
  const [zones, setZones] = useState(buildSnapshot());
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const fallbackPollMs = Number(import.meta.env.VITE_CROWD_POLL_INTERVAL_MS || 15000);

  useEffect(() => {
    let mounted = true;

    async function refreshFromApi() {
      try {
        const response = await api.getCrowd();
        if (!mounted) return;

        setZones(mergeWithStadiumZones(response));
        setLastUpdated(new Date().toISOString());
      } catch (error) {
        if (!mounted) return;
        setZones(buildSnapshot());
      } finally {
        if (mounted) setIsLoading(false);
      }
    }


    let unsubscribe = null;
    let timer = null;

    if (hasFirebaseConfig && db) {
      unsubscribe = onSnapshot(
        collection(db, 'crowd_zones'),
        (snapshot) => {
          if (!mounted) return;

          const firestoreZones = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setZones(mapFirestoreZones(firestoreZones));
          setLastUpdated(new Date().toISOString());
          setIsLoading(false);
        },
        () => {
          refreshFromApi();
          timer = setInterval(refreshFromApi, fallbackPollMs);
        },
      );
    } else {
      refreshFromApi();
      timer = setInterval(refreshFromApi, fallbackPollMs);
    }

    return () => {
      mounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  const value = useMemo(() => ({ zones, setZones, isLoading, lastUpdated }), [zones, isLoading, lastUpdated]);

  return <CrowdContext.Provider value={value}>{children}</CrowdContext.Provider>;
}

export function useCrowd() {
  const context = useContext(CrowdContext);

  if (!context) {
    throw new Error('useCrowd must be used within CrowdProvider');
  }

  return context;
}
