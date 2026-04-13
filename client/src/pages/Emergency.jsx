import AlertBox from '../components/AlertBox';
import Heatmap from '../components/Heatmap';
import { useCrowd } from '../context/CrowdContext';
import { findSafestExit } from '../utils/routeAlgorithm';
import { stadiumGraph } from '../data/stadium';

export default function Emergency() {
  const { zones } = useCrowd();
  const crowdMap = Object.fromEntries(zones.map((zone) => [zone.id, zone.density]));
  const safestExit = findSafestExit(stadiumGraph, 'A1', ['E1', 'E2'], crowdMap);

  return (
    <main className="emergency-screen">
      <section className="emergency-card">
        <h1>🚨 Emergency Mode</h1>
        <p>Follow the safest route to exit immediately.</p>

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
          <button className="danger-btn" type="button">Exit Now</button>
          <button className="secondary-btn" type="button">Alert Control Room</button>
        </div>

        <Heatmap zones={zones} route={safestExit.path} height={360} compact />

        <div className="emergency-notes">
          <AlertBox title="Broadcast ready" description="Security teams can push live announcements instantly." tone="red" />
          <AlertBox title="Traffic control" description="Corridor routing is automatically prioritizing safer paths." tone="yellow" />
        </div>
      </section>
    </main>
  );
}
