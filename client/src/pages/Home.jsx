import { Link } from 'react-router-dom';
import { useCrowd } from '../context/CrowdContext';

export default function Home() {
  const { zones } = useCrowd();
  const averageDensity = Math.round(zones.reduce((sum, zone) => sum + zone.density, 0) / zones.length);

  return (
    <main className="home-hero">
      <section className="home-hero-card">
        <span className="badge green">Live stadium intelligence</span>
        <h2>CrowdSense AI</h2>
        <p className="home-subtitle">Smart Crowd Navigation for Safer Events</p>
        <p>
          CrowdSense AI combines heatmaps, smart routing, queue estimates, and emergency guidance to make large event movement feel predictable and safe.
        </p>

        <div className="hero-actions">
          <Link to="/map" className="primary-btn">View Live Map</Link>
          <Link to="/emergency" className="danger-btn">Emergency</Link>
          <Link to="/admin" className="secondary-btn">Admin Dashboard</Link>
        </div>

        <div className="home-stats">
          <div className="metric"><label>Average crowd</label><strong>{averageDensity}%</strong></div>
          <div className="metric"><label>Active zones</label><strong>{zones.length}</strong></div>
          <div className="metric"><label>Peak queue</label><strong>{Math.max(...zones.map((zone) => zone.queue))}m</strong></div>
          <div className="metric"><label>Risk level</label><strong>{averageDensity > 65 ? 'High' : 'Safe'}</strong></div>
        </div>
      </section>
    </main>
  );
}
