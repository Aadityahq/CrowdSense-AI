import { Circle, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getDensityLabel, getDensityLevel } from '../utils/calculateDensity';
import { stadiumCenter, stadiumNodeMap } from '../data/stadium';

function toFiniteNumber(value, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDensity(value) {
  const density = toFiniteNumber(value, 0);
  return Math.max(0, Math.min(100, density));
}

function toRadius(value) {
  return toDensity(value) * 5 + 100;
}

function getColor(density) {
  if (density >= 75) {
    return '#ef4444';
  }

  if (density >= 40) {
    return '#f59e0b';
  }

  return '#22c55e';
}

export default function Heatmap({ zones = [], route = [], height = 540, compact = false }) {
  const routeCoordinates = route
    .map((nodeId) => stadiumNodeMap[nodeId])
    .filter(Boolean)
    .map((zone) => [zone.lat, zone.lng]);

  return (
    <div className={`map-shell ${compact ? 'compact' : ''}`} style={{ height }}>
      <MapContainer center={stadiumCenter} zoom={17} scrollWheelZoom={false} className="stadium-map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {zones.map((zone) => {
          const lat = toFiniteNumber(zone.lat, NaN);
          const lng = toFiniteNumber(zone.lng, NaN);
          const density = toDensity(zone.density);
          const queue = Math.max(0, Math.round(toFiniteNumber(zone.queue, 0)));

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
          }

          return (
          <Circle
            key={zone.id}
            center={[lat, lng]}
            radius={toRadius(density)}
            pathOptions={{
              color: getColor(density),
              fillColor: getColor(density),
              fillOpacity: 0.3,
              weight: 2,
            }}
          >
            <Popup>
              <div className="tooltip-card">
                <strong>{zone.name}</strong>
                <div>{getDensityLabel(density)} · {density}%</div>
                <div>Queue {queue}m</div>
              </div>
            </Popup>
          </Circle>
          );
        })}

        {routeCoordinates.length > 1 ? (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: '#4dd4ac', weight: 5, opacity: 0.92 }}
          />
        ) : null}
      </MapContainer>

      <div className="map-legend">
        <span className="badge red">High crowd</span>
        <span className="badge yellow">Medium crowd</span>
        <span className="badge green">Low crowd</span>
      </div>
    </div>
  );
}
