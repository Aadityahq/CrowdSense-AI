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

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(Boolean(user));
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
