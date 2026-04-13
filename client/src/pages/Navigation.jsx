import { useMemo, useState } from 'react';
import Heatmap from '../components/Heatmap';
import RouteMap from '../components/RouteMap';
import { useCrowd } from '../context/CrowdContext';
import { stadiumGraph, stadiumZones } from '../data/stadium';
import { findBestRoute } from '../utils/routeAlgorithm';

export default function Navigation() {
  const { zones } = useCrowd();
  const [start, setStart] = useState('C1');
  const [end, setEnd] = useState('A1');

  const crowdMap = useMemo(() => Object.fromEntries(zones.map((zone) => [zone.id, zone.density])), [zones]);
  const routeResult = useMemo(() => findBestRoute(stadiumGraph, start, end, crowdMap), [start, end, crowdMap]);

  return (
    <main className="page split">
      <section className="panel stack">
        <h2>Smart Navigation</h2>
        <p>Choose a start and destination, then get the least crowded route through the stadium.</p>

        <div className="form-row">
          <label className="field">
            Start
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

        <RouteMap route={routeResult.path} cost={routeResult.cost} />
        <Heatmap zones={zones} route={routeResult.path} height={420} compact />
      </section>

      <aside className="panel stack">
        <span className="section-label">How it works</span>
        <p className="muted">Paths that pass through crowded zones get a higher weight, so the algorithm prefers safer movement.</p>
        <div className="stack">
          <div className="badge green">Crowd weighted pathfinding</div>
          <div className="badge yellow">Queue-aware recommendations</div>
          <div className="badge red">Emergency override ready</div>
        </div>
      </aside>
    </main>
  );
}
