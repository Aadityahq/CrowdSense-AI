import { useEffect, useMemo, useState } from 'react';
import AlertBox from '../components/AlertBox';
import Heatmap from '../components/Heatmap';
import { useCrowd } from '../context/CrowdContext';
import { findSafestExit } from '../utils/routeAlgorithm';
import { stadiumGraph, stadiumZones } from '../data/stadium';
import { api } from '../services/api';

function distanceSquared(aLat, aLng, bLat, bLng) {
  const dLat = aLat - bLat;
  const dLng = aLng - bLng;
  return dLat * dLat + dLng * dLng;
}

function findNearestZone(latitude, longitude) {
  const candidates = stadiumZones.filter((zone) => zone.type !== 'exit');

  let nearest = candidates[0] || stadiumZones[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const zone of candidates) {
    const nextDistance = distanceSquared(latitude, longitude, zone.lat, zone.lng);
    if (nextDistance < nearestDistance) {
      nearest = zone;
      nearestDistance = nextDistance;
    }
  }

  return nearest?.id || 'A1';
}

export default function Emergency() {
  const { zones } = useCrowd();
  const [startZone, setStartZone] = useState('A1');
  const [locationNote, setLocationNote] = useState('Using default start zone.');
  const [actionNotice, setActionNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [alerting, setAlerting] = useState(false);
  const crowdMap = Object.fromEntries(zones.map((zone) => [zone.id, zone.density]));

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationNote('Geolocation unavailable. Using default start zone.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextStart = findNearestZone(position.coords.latitude, position.coords.longitude);
        setStartZone(nextStart);
        setLocationNote(`Detected nearest zone: ${nextStart}`);
      },
      () => {
        setLocationNote('Could not access location. Using default start zone.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  }, []);

  const safestExit = useMemo(
    () => findSafestExit(stadiumGraph, startZone, ['E1', 'E2'], crowdMap),
    [startZone, crowdMap],
  );

  function handleExitNow() {
    const destinationId = safestExit.path.at(-1);
    const destinationZone = stadiumZones.find((zone) => zone.id === destinationId);

    if (!destinationZone) {
      setActionError('Could not resolve the safest exit. Please follow venue signs and staff instructions.');
      setActionNotice('');
      return;
    }

    setActionError('');
    setActionNotice(`Navigating to ${destinationZone.name}. Follow the highlighted path: ${safestExit.path.join(' -> ')}`);

    const mapCard = document.querySelector('.emergency-map-card');
    if (mapCard) {
      mapCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationZone.lat},${destinationZone.lng}&travelmode=walking`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  }

  async function handleAlertControlRoom() {
    try {
      setAlerting(true);
      setActionError('');

      const destinationId = safestExit.path.at(-1) || 'E1';
      const routeLabel = safestExit.path.length > 0 ? safestExit.path.join(' -> ') : 'A1 -> E1';

      await api.createAlert({
        title: 'Emergency assistance requested',
        description: `User requested control room support. Start zone: ${startZone}. Suggested exit: ${destinationId}. Route: ${routeLabel}.`,
        severity: 'high',
      });

      setActionNotice('Control room alert sent. Stay calm and keep following the safe route.');
    } catch (requestError) {
      const detail = requestError?.message || '';
      if (detail.includes('(401)') || detail.includes('(403)')) {
        setActionError('You are not allowed to broadcast alerts from this account. Please contact event staff immediately.');
      } else {
        setActionError('Could not reach control room service right now. Please approach nearby staff and follow exit guidance.');
      }
      setActionNotice('');
    } finally {
      setAlerting(false);
    }
  }

  return (
    <main className="emergency-screen">
      <section className="emergency-card">
        <h1>🚨 Emergency Mode</h1>
        <p>Follow the safest route to exit immediately.</p>
        <p className="muted">{locationNote}</p>

        <div className="emergency-exit-card">
          <span>Nearest Exit</span>
          <strong>{safestExit.path.at(-1) || 'Gate A'}</strong>
        </div>

        <div className="emergency-route-card">
          <span className="badge green">Safe path</span>
          <h3>{safestExit.path.join(' → ')}</h3>
          <p>Avoid red zones and follow the green route shown on the map.</p>
        </div>

        <ul className="emergency-list">
          <li>Avoid red zones</li>
          <li>Follow green path</li>
          <li>Stay calm</li>
        </ul>

        <div className="hero-actions emergency-actions">
          <button className="danger-btn" type="button" onClick={handleExitNow}>Exit Now</button>
          <button className="secondary-btn" type="button" onClick={handleAlertControlRoom} disabled={alerting}>
            {alerting ? 'Alerting...' : 'Alert Control Room'}
          </button>
        </div>

        {actionNotice ? <p className="success-text">{actionNotice}</p> : null}
        {actionError ? <p className="error-text">{actionError}</p> : null}

        <div className="emergency-map-card">
          <div className="emergency-map-header">
            <span className="section-label">Emergency map</span>
            <p>Green route highlights the safest path from your current location to the nearest exit.</p>
          </div>

          <Heatmap zones={zones} route={safestExit.path} height={360} compact />
        </div>

        <div className="emergency-notes">
          <AlertBox title="Broadcast ready" description="Security teams can push live announcements instantly." tone="red" />
          <AlertBox title="Traffic control" description="Corridor routing is automatically prioritizing safer paths." tone="yellow" />
        </div>
      </section>
    </main>
  );
}
