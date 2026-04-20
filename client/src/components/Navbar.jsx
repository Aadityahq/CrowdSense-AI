import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../firebase';

const links = [
  { to: '/', label: 'Home' },
  { to: '/map', label: 'Map' },
  { to: '/navigation', label: 'Navigation' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/emergency', label: 'Emergency' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!hasFirebaseConfig ? Boolean(localStorage.getItem('crowdsense_token')) : false);
  const [role, setRole] = useState((localStorage.getItem('role') || '').toUpperCase());

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(Boolean(user));

      if (!user) {
        setRole('');
        return;
      }

      const storedRole = (localStorage.getItem('role') || '').toUpperCase();
      if (storedRole) {
        setRole(storedRole);
        return;
      }

      try {
        const profile = JSON.parse(localStorage.getItem('crowdsense_user') || '{}');
        setRole((profile?.role || '').toUpperCase());
      } catch (error) {
        setRole('');
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      if (auth) {
        await signOut(auth);
      }
    } finally {
      localStorage.removeItem('crowdsense_token');
      localStorage.removeItem('crowdsense_user');
      localStorage.removeItem('role');
      setIsLoggedIn(false);
      setRole('');
      navigate('/');
    }
  }

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
          {isLoggedIn && role === 'ADMIN' ? <NavLink to="/admin">Admin</NavLink> : null}
          {!isLoggedIn ? <NavLink to="/login">Login/SignUp</NavLink> : null}
          {isLoggedIn ? (
            <button type="button" className="secondary-btn navbar-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
