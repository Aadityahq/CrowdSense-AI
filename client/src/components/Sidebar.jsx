import { NavLink } from 'react-router-dom';

const links = [
  { to: '/map', label: 'Heatmap' },
  { to: '/navigation', label: 'Routes' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/emergency', label: 'Emergency' },
  { to: '/admin', label: 'Admin' },
];

export default function Sidebar() {
  return (
    <aside className="panel stack">
      <span className="section-label">Quick Actions</span>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} className="badge">
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
