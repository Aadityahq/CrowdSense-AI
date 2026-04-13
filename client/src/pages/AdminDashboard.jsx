import { useEffect, useState } from 'react';
import Heatmap from '../components/Heatmap';
import { api } from '../services/api';

export default function AdminDashboard() {
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
        setError('Could not load crowd data from the server.');
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
          <h2>Admin Dashboard</h2>
          <p className="muted">Loading live crowd data...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page admin-layout">
        <section className="admin-main panel">
          <h2>Admin Dashboard</h2>
          <p className="error-text">{error}</p>
        </section>
      </main>
    );
  }

  const highDensityZones = zones.filter((zone) => zone.density >= 75).length;
  const totalCrowd = zones.reduce((sum, zone) => sum + zone.density, 0);

  return (
    <main className="page admin-layout">
      <section className="admin-main">
        <h2>Admin Dashboard</h2>
        <p>Monitor venue pressure, zone hotspots, and live risk signals.</p>

        <div className="panel-grid">
          <div className="metric"><label>Total crowd load</label><strong>{Math.round(totalCrowd)}%</strong></div>
          <div className="metric"><label>Hot zones</label><strong>{highDensityZones}</strong></div>
          <div className="metric"><label>Avg wait</label><strong>{Math.round(zones.reduce((sum, zone) => sum + zone.queue, 0) / zones.length)}m</strong></div>
          <div className="metric"><label>Stadium status</label><strong>{highDensityZones > 1 ? 'Watch' : 'Normal'}</strong></div>
        </div>

        <div className="panel mini-map-panel">
          <span className="section-label">Mini heatmap</span>
          <Heatmap zones={zones} height={360} compact />
        </div>
      </section>

      <aside className="panel stack admin-side">
        <span className="section-label">Broadcast controls</span>
        <div className="stack">
          <div className="badge red">Push alert to all attendees</div>
          <div className="badge yellow">Highlight congested zones</div>
          <div className="badge green">Open safety channels</div>
        </div>
      </aside>
    </main>
  );
}

