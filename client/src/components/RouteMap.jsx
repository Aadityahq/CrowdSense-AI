export default function RouteMap({ route = [], cost = 0 }) {
  return (
    <div className="route-card">
      <span className="section-label">Suggested Route</span>
      <h3>{route.join(' → ')}</h3>
      <p className="muted">Weighted by distance and crowd density.</p>
      <div className="route-meta">Estimated route cost: {Number.isFinite(cost) ? cost : 'fallback path'}</div>
    </div>
  );
}
