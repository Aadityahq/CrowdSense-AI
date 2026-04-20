import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../firebase';

export default function ProtectedRoute({ children, allowedRole, allowedRoles }) {
  const [isReady, setIsReady] = useState(!hasFirebaseConfig);
  const [isAuthenticated, setIsAuthenticated] = useState(!hasFirebaseConfig ? Boolean(localStorage.getItem('crowdsense_token')) : false);
  const [isVerified, setIsVerified] = useState(!hasFirebaseConfig ? true : false);

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      setIsVerified(Boolean(user?.emailVerified));
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  const configuredRoles = Array.isArray(allowedRoles)
    ? allowedRoles
    : allowedRole
      ? [allowedRole]
      : [];

  const storedRole = localStorage.getItem('role');
  const role = (storedRole || 'USER').toUpperCase();

  if (!isReady) {
    return <div className="page"><p className="muted">Checking session...</p></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (configuredRoles.length > 0 && !configuredRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
