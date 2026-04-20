import Heatmap from '../components/Heatmap';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCrowd } from '../context/CrowdContext';
import { findBestRoute } from '../utils/routeAlgorithm';
import { stadiumGraph, stadiumZones } from '../data/stadium';
import { predictTrend } from '../utils/predictionLogic';

export default function MapView() {
  const { zones, isLoading, lastUpdated } = useCrowd();
  const [start, setStart] = useState('C1');
  const [end, setEnd] = useState('A1');
  const [history, setHistory] = useState([]);
  const crowdMap = Object.fromEntries(zones.map((zone) => [zone.id, zone.density]));
  const route = findBestRoute(stadiumGraph, start, end, crowdMap);

  const crowdAverage = Math.round(zones.reduce((sum, zone) => sum + zone.density, 0) / zones.length);
  const queueAverage = Math.round(zones.reduce((sum, zone) => sum + zone.queue, 0) / zones.length);
  const trend = useMemo(() => predictTrend(history), [history]);
  const crowdScore = Math.max(0, Math.min(100, Math.round(100 - crowdAverage * 0.75 - queueAverage * 1.2)));
  const routeText = route.path.length ? route.path.join(' → ') : 'No safe route available';

  useEffect(() => {
    if (!Number.isFinite(crowdAverage)) return;

    setHistory((previous) => {
      const next = [...previous, crowdAverage];
      return next.slice(-10);
    });
  }, [crowdAverage]);

  if (isLoading && zones.length === 0) {
    return (
      <main className="map-dashboard">
        <section className="map-stage panel loading-panel">
          <h2>Loading live map...</h2>
          <p>Connecting to crowd feed and route service.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="map-dashboard" aria-labelledby="map-view-title">
      <aside className="map-sidebar">
        <div>
          <span className="badge blue-badge">CrowdSense AI</span>
          <h2 id="map-view-title">Smart stadium navigation</h2>
          <p>Use the least crowded path and keep moving with real-time crowd awareness.</p>
        </div>

        <div className="sidebar-form">
          <label className="field">
            Your Location
            <select value={start} onChange={(event) => setStart(event.target.value)}>
              {stadiumZones.map((zone) => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            Destination
            <select value={end} onChange={(event) => setEnd(event.target.value)}>
              {stadiumZones.map((zone) => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="sidebar-stats">
          <div className="stat-card">
            <p>Crowd Level</p>
            <strong className={crowdAverage >= 75 ? 'danger-text' : crowdAverage >= 40 ? 'warning-text' : 'safe-text'}>
              {crowdAverage >= 75 ? 'High' : crowdAverage >= 40 ? 'Medium' : 'Low'}
            </strong>
          </div>

          <div className="stat-card">
            <p>Queue Time</p>
            <strong>{queueAverage} mins</strong>
          </div>

          <div className="stat-card crowd-score-card">
            <p>Crowd Score</p>
            <strong>{crowdScore}%</strong>
          </div>

          <div className="stat-card">
            <p>Trend</p>
            <strong className={trend === 'increasing' ? 'danger-text' : trend === 'decreasing' ? 'safe-text' : 'warning-text'}>
              {trend}
            </strong>
          </div>
        </div>

        <div className="sidebar-actions">
          <button className="primary-btn" type="button">Find Best Route</button>
          <Link to="/emergency" className="danger-btn danger-link">Emergency Mode</Link>
        </div>
      </aside>

      <section className="map-stage">
        <div className="sr-only" aria-live="polite">
          {`Crowd average ${Number.isFinite(crowdAverage) ? crowdAverage : 0} percent. Queue average ${Number.isFinite(queueAverage) ? queueAverage : 0} minutes. Trend ${trend}. Route ${routeText}.`}
        </div>
        <Heatmap zones={zones} route={route.path} height={560} />

        <div className="floating-status">
          <p className="muted-label">Status</p>
          <strong>Live Monitoring Active</strong>
          <p className="muted-label">Updated {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'now'}</p>
        </div>

        <div className="route-summary-card">
          <span className="badge green">Optimized route</span>
          <h3>{routeText}</h3>
          <p>Weighted by distance and live crowd density.</p>
          <div className="route-meta-row">
            <span>Route cost</span>
            <strong>{Number.isFinite(route.cost) ? route.cost : 'Fallback'}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
