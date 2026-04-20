import { useEffect, useState } from 'react';
import Heatmap from '../components/Heatmap';
import { api } from '../services/api';
import { db, hasFirebaseConfig } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [sessionError, setSessionError] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [densityValue, setDensityValue] = useState(55);
  const [queueValue, setQueueValue] = useState(10);
  const [crowdActionState, setCrowdActionState] = useState({ loading: false, error: '', success: '' });
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('medium');
  const [alertActionState, setAlertActionState] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    async function fetchCrowd() {
      try {
        setLoading(true);
        const data = await api.getCrowd();
        setZones(data);
        setSelectedZoneId((previous) => previous || data[0]?.id || '');
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
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) || null;

  async function handleCheckSession() {
    try {
      setSessionLoading(true);
      setSessionError('');

      const payload = await api.getAuthSession();
      setSession(payload);
    } catch (requestError) {
      setSession(null);
      setSessionError(requestError.message || 'Could not verify backend session.');
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleCrowdUpdate(event) {
    event.preventDefault();

    if (!selectedZone) {
      setCrowdActionState({ loading: false, error: 'Select a valid zone before updating.', success: '' });
      return;
    }

    if (!hasFirebaseConfig || !db) {
      setCrowdActionState({ loading: false, error: 'Firebase is not configured for Firestore writes.', success: '' });
      return;
    }

    try {
      setCrowdActionState({ loading: true, error: '', success: '' });

      await setDoc(
        doc(db, 'crowd_zones', selectedZone.id),
        {
          id: selectedZone.id,
          name: selectedZone.name,
          lat: Number(selectedZone.lat),
          lng: Number(selectedZone.lng),
          density: Number(densityValue),
          queue: Number(queueValue),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      setZones((previous) => previous.map((zone) => (
        zone.id === selectedZone.id
          ? { ...zone, density: Number(densityValue), queue: Number(queueValue) }
          : zone
      )));

      setCrowdActionState({ loading: false, error: '', success: `Updated ${selectedZone.name} successfully.` });
    } catch (requestError) {
      setCrowdActionState({
        loading: false,
        error: requestError.message || 'Failed to update crowd zone.',
        success: '',
      });
    }
  }

  async function handleSendAlert(event) {
    event.preventDefault();

    try {
      setAlertActionState({ loading: true, error: '', success: '' });

      await api.createAlert({
        title: alertTitle,
        description: alertDescription,
        severity: alertSeverity,
      });

      setAlertActionState({ loading: false, error: '', success: 'Alert sent successfully.' });
      setAlertTitle('');
      setAlertDescription('');
      setAlertSeverity('medium');
    } catch (requestError) {
      setAlertActionState({
        loading: false,
        error: requestError.message || 'Could not send alert.',
        success: '',
      });
    }
  }

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

        <div className="panel stack">
          <span className="section-label">Crowd control</span>
          <p className="muted">Update zone density and queue values to push live map changes.</p>

          <form className="stack" onSubmit={handleCrowdUpdate}>
            <label className="field">
              Zone
              <select value={selectedZoneId} onChange={(event) => setSelectedZoneId(event.target.value)} required>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </label>

            <label className="field">
              Density ({densityValue}%)
              <input
                className="login-input"
                type="range"
                min="0"
                max="100"
                value={densityValue}
                onChange={(event) => setDensityValue(Number(event.target.value))}
              />
            </label>

            <label className="field">
              Queue ({queueValue} min)
              <input
                className="login-input"
                type="range"
                min="0"
                max="25"
                value={queueValue}
                onChange={(event) => setQueueValue(Number(event.target.value))}
              />
            </label>

            <button type="submit" className="primary-btn" disabled={crowdActionState.loading}>
              {crowdActionState.loading ? 'Updating zone...' : 'Update Zone'}
            </button>
          </form>

          {crowdActionState.error ? <p className="error-text">{crowdActionState.error}</p> : null}
          {crowdActionState.success ? <p className="success-text">{crowdActionState.success}</p> : null}
        </div>
      </section>

      <aside className="panel stack admin-side">
        <span className="section-label">Broadcast controls</span>

        <form className="panel stack session-debug-panel" onSubmit={handleSendAlert}>
          <span className="section-label">Send alert</span>
          <label className="field">
            Title
            <input
              className="login-input"
              value={alertTitle}
              onChange={(event) => setAlertTitle(event.target.value)}
              placeholder="Gate 2 congestion"
              required
            />
          </label>

          <label className="field">
            Description
            <textarea
              className="login-input"
              value={alertDescription}
              onChange={(event) => setAlertDescription(event.target.value)}
              placeholder="Use Gate 1 for faster movement."
              rows={3}
              required
            />
          </label>

          <label className="field">
            Severity
            <select value={alertSeverity} onChange={(event) => setAlertSeverity(event.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>

          <button type="submit" className="primary-btn" disabled={alertActionState.loading}>
            {alertActionState.loading ? 'Sending alert...' : 'Send Alert'}
          </button>

          {alertActionState.error ? <p className="error-text">{alertActionState.error}</p> : null}
          {alertActionState.success ? <p className="success-text">{alertActionState.success}</p> : null}
        </form>

        <div className="panel session-debug-panel">
          <span className="section-label">Auth debug</span>
          <p className="muted">Verify Firebase token forwarding and backend role resolution.</p>
          <button type="button" className="secondary-btn" onClick={handleCheckSession} disabled={sessionLoading}>
            {sessionLoading ? 'Checking session...' : 'Check backend session'}
          </button>
          {sessionError ? <p className="error-text">{sessionError}</p> : null}
          {session ? <pre className="session-debug-output">{JSON.stringify(session, null, 2)}</pre> : null}
        </div>
      </aside>
    </main>
  );
}

