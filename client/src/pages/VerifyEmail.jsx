import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { reload, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, hasFirebaseConfig } from '../firebase';

function normalizeRole(value) {
  return String(value || '').trim().toUpperCase();
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('We sent a verification link. Keep this tab open while you verify your email.');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsUntilCheck, setSecondsUntilCheck] = useState(3);

  const pendingEmail = location.state?.email || auth?.currentUser?.email || '';
  const pendingName = location.state?.name || '';

  async function createUserIfNotExists(user) {
    if (!db) {
      return;
    }

    const profileRef = doc(db, 'users', user.uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      return;
    }

    const derivedName = pendingName || (user.displayName || user.email || '').split('@')[0] || 'Attendee';
    await setDoc(profileRef, {
      uid: user.uid,
      name: derivedName,
      email: user.email || pendingEmail,
      role: 'USER',
      createdAt: new Date().toISOString(),
    });
  }

  useEffect(() => {
    if (!hasFirebaseConfig || !auth || !auth.currentUser) {
      return;
    }

    let active = true;

    async function checkVerification() {
      try {
        await reload(auth.currentUser);

        if (!active || !auth.currentUser) {
          return;
        }

        if (auth.currentUser.emailVerified) {
          await createUserIfNotExists(auth.currentUser);

          const profileRef = doc(db, 'users', auth.currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          const role = normalizeRole(profileSnap.data()?.role || 'USER');

          localStorage.setItem('role', role);
          localStorage.setItem('crowdsense_user', JSON.stringify({
            email: auth.currentUser.email || pendingEmail,
            role,
          }));

          setMessage('Email verified. Redirecting...');
          navigate(role === 'ADMIN' ? '/admin' : role === 'ORGANIZER' ? '/organizer' : '/map', { replace: true });
        }
      } catch (checkError) {
        if (active) {
          setError(checkError.message || 'Verification check failed.');
        }
      }
    }

    const tickInterval = setInterval(() => {
      setSecondsUntilCheck((current) => (current <= 1 ? 3 : current - 1));
    }, 1000);

    const pollInterval = setInterval(async () => {
      await checkVerification();
    }, 3000);

    checkVerification();

    return () => {
      active = false;
      clearInterval(tickInterval);
      clearInterval(pollInterval);
    };
  }, [navigate, pendingEmail, pendingName]);

  async function handleResend() {
    try {
      setLoading(true);
      setError('');

      if (!hasFirebaseConfig || !auth || !auth.currentUser) {
        throw new Error('No active user session. Login again to resend verification email.');
      }

      await sendEmailVerification(auth.currentUser);
      setMessage('Verification email sent again.');
    } catch (requestError) {
      setError(requestError.message || 'Could not resend verification email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="panel login-panel verify-panel">
        <h2>Verify Your Email</h2>
        <p>Please verify your email address before accessing protected routes.</p>
        {pendingEmail ? <p className="muted">Pending account: {pendingEmail}</p> : null}
        <p className="verify-timer">Auto-checking verification in {secondsUntilCheck}s</p>

        <div className="stack">
          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <div className="verify-steps">
            <p>1. Open your inbox and click the verification link.</p>
            <p>2. Return to this tab. We will auto-redirect when verified.</p>
          </div>

          <button type="button" className="primary-btn" onClick={handleResend} disabled={loading}>
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <Link to="/login" className="secondary-btn auth-link-btn">Go to Login</Link>
        </div>
      </section>
    </main>
  );
}
