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
  const mostCrowdedZone = zones.reduce((max, zone) => (max && max.density >= zone.density ? max : zone), null);
  const leastCrowdedZone = zones.reduce((min, zone) => (min && min.density <= zone.density ? min : zone), null);

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

        <div className="panel-grid">
          <div className="metric">
            <label>Most crowded zone</label>
            <strong>{mostCrowdedZone ? `${mostCrowdedZone.name} (${mostCrowdedZone.density}%)` : 'N/A'}</strong>
          </div>
          <div className="metric">
            <label>Least crowded zone</label>
            <strong>{leastCrowdedZone ? `${leastCrowdedZone.name} (${leastCrowdedZone.density}%)` : 'N/A'}</strong>
          </div>
          <div className="metric">
            <label>Peak queue zone</label>
            <strong>{mostCrowdedZone ? Math.round((mostCrowdedZone.queue || 0)) : 0}m</strong>
          </div>
          <div className="metric">
            <label>Priority action</label>
            <strong>{highRiskZones > 1 ? 'Deploy staff' : 'Monitor'}</strong>
          </div>
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
          <div className="badge green">{leastCrowdedZone ? `Relief zone: ${leastCrowdedZone.name}` : 'Relief zone not available'}</div>
          <div className="badge yellow">{mostCrowdedZone ? `Focus zone: ${mostCrowdedZone.name}` : 'Focus zone not available'}</div>
          <div className="badge red">{highRiskZones > 0 ? `${highRiskZones} zones need intervention` : 'No high-risk zone right now'}</div>
        </div>
      </aside>
    </main>
  );
}
