import { Link } from 'react-router-dom';
import { useCrowd } from '../context/CrowdContext';

export default function Home() {
  const { zones } = useCrowd();
  const totalDensity = zones.reduce((sum, zone) => sum + zone.density, 0);
  const averageDensity = zones.length ? Math.round(totalDensity / zones.length) : 0;
  const peakQueue = zones.length ? Math.max(...zones.map((zone) => zone.queue || 0)) : 0;

  return (
    <main className="home-hero">
      <section className="home-hero-card">
        <div className="home-hero-topline">
          <span className="badge green">Live stadium intelligence</span>
          <span className="badge">Firebase Auth + Firestore</span>
        </div>

        <h2>CrowdSense AI</h2>
        <p className="home-subtitle">See crowd pressure, choose safer paths, and react faster during peak event moments.</p>
        <p className="home-lead">
          CrowdSense AI gives attendees a live crowd map, route suggestions, queue estimates, and emergency guidance.
          Security and organizers can broadcast alerts and update zone pressure so everyone sees the change instantly.
        </p>

        <div className="hero-actions">
          <Link to="/map" className="primary-btn">View Live Map</Link>
          <Link to="/emergency" className="danger-btn">Emergency</Link>
        </div>

        <div className="home-summary-list">
          <p>Live heatmap with zone density and queue pressure.</p>
          <p>Smart routing that avoids crowded paths.</p>
          <p>Emergency guidance with safest-exit navigation.</p>
        </div>

        <div className="home-stats">
          <div className="metric"><label>Average crowd</label><strong>{averageDensity}%</strong></div>
          <div className="metric"><label>Active zones</label><strong>{zones.length}</strong></div>
          <div className="metric"><label>Peak queue</label><strong>{peakQueue}m</strong></div>
          <div className="metric"><label>Risk level</label><strong>{averageDensity > 65 ? 'High' : 'Safe'}</strong></div>
        </div>
      </section>
    </main>
  );
}
