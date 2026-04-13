import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/map', label: 'Map' },
  { to: '/navigation', label: 'Navigation' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/emergency', label: 'Emergency' },
  { to: '/login', label: 'Login' },
];

export default function Navbar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <h1>CrowdSense AI</h1>
            <p>Smart stadium experience system</p>
          </div>
        </div>

        <nav className="nav-links">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
