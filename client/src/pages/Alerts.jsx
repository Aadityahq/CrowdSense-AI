import { useEffect, useRef, useState } from 'react';
import AlertBox from '../components/AlertBox';
import { api } from '../services/api';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../firebase';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveNotice, setLiveNotice] = useState('');
  const seenAlertIdsRef = useRef(new Set());

  useEffect(() => {
    let timer = null;
    let unsubscribe = null;

    async function loadAlerts() {
      try {
        setLoading(true);
        const data = await api.getAlerts();
        setAlerts(data);

        if (seenAlertIdsRef.current.size === 0) {
          data.forEach((alert) => {
            if (alert.id) {
              seenAlertIdsRef.current.add(alert.id);
            }
          });
        }
      } catch (requestError) {
        setError('Could not load alerts from the server.');
      } finally {
        setLoading(false);
      }
    }

    if (hasFirebaseConfig && db) {
      unsubscribe = onSnapshot(
        collection(db, 'alerts'),
        (snapshot) => {
          const liveAlerts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          const incoming = liveAlerts.filter((alert) => alert.id && !seenAlertIdsRef.current.has(alert.id));
          if (incoming.length > 0) {
            setLiveNotice(`New alert received: ${incoming[0].title || 'Security update'}`);
            setTimeout(() => {
              setLiveNotice('');
            }, 3500);
          }

          liveAlerts.forEach((alert) => {
            if (alert.id) {
              seenAlertIdsRef.current.add(alert.id);
            }
          });

          setAlerts(liveAlerts);
          setLoading(false);
        },
        () => {
          loadAlerts();
          timer = setInterval(loadAlerts, 3000);
        },
      );
    } else {
      loadAlerts();
      timer = setInterval(loadAlerts, 3000);
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }

      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  function toTone(severity) {
    if (severity === 'high') return 'red';
    if (severity === 'medium') return 'yellow';
    return 'green';
  }

  return (
    <main className="page">
      <h2>Real-Time Alerts</h2>
      <p>Broadcasts and live guidance for attendees and event staff.</p>

      {loading ? <p className="muted">Loading alerts...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {liveNotice ? <p className="success-text">{liveNotice}</p> : null}

      <div className="alert-list">
        {alerts.map((alert) => (
          <AlertBox
            key={alert.id || alert.title}
            title={alert.title}
            description={alert.description}
            tone={toTone(alert.severity)}
          />
        ))}
      </div>
    </main>
  );
}
