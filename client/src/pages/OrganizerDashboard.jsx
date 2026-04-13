import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function OrganizerDashboard() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCrowd() {
      try {
        setLoading(true);
        const data = await api.getCrowd();
        setZones(data);
      } catch (requestError) {
        setError('Could not load analytics data from the server.');
      } finally {
        setLoading(false);
      }
    }

    fetchCrowd();
  }, []);

  if (loading) {
    return (
      <main className="page admin-layout">
        <section className="admin-main panel">
          <h2>Organizer Dashboard</h2>
          <p className="muted">Loading analytics...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page admin-layout">
        <section className="admin-main panel">
          <h2>Organizer Dashboard</h2>
          <p className="error-text">{error}</p>
        </section>
      </main>
    );
  }

  const totalCrowd = zones.reduce((sum, zone) => sum + zone.density, 0);
  const highRiskZones = zones.filter((zone) => zone.density >= 75).length;
  const avgDensity = zones.length ? Math.round(totalCrowd / zones.length) : 0;

  return (
    <main className="page admin-layout">
      <section className="admin-main">
        <h2>Organizer Dashboard</h2>
        <p>Analytics view for strategic crowd planning and event operations.</p>

        <div className="panel-grid">
          <div className="metric"><label>Total crowd index</label><strong>{Math.round(totalCrowd)}</strong></div>
          <div className="metric"><label>Average density</label><strong>{avgDensity}%</strong></div>
          <div className="metric"><label>High risk zones</label><strong>{highRiskZones}</strong></div>
          <div className="metric"><label>Status</label><strong>{highRiskZones > 1 ? 'Review' : 'Stable'}</strong></div>
        </div>

        <div className="panel mini-map-panel">
          <span className="section-label">Zone breakdown</span>
          <div className="stack">
            {zones.map((zone) => (
              <div key={zone.id} className="stat-card">
                <p>{zone.name}</p>
                <strong>{zone.density}%</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="panel stack admin-side">
        <span className="section-label">Organizer insights</span>
        <div className="stack">
          <div className="badge green">Audience flow summary</div>
          <div className="badge yellow">Capacity risk analysis</div>
          <div className="badge red">Peak-time planning</div>
        </div>
      </aside>
    </main>
  );
}
