import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { reload, sendEmailVerification, signOut } from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../firebase';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Check your inbox and verify your email to continue.');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pendingEmail = location.state?.email || auth?.currentUser?.email || '';

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

  async function handleIHaveVerified() {
    try {
      setLoading(true);
      setError('');

      if (!hasFirebaseConfig || !auth || !auth.currentUser) {
        throw new Error('No active user session. Login after verifying your email.');
      }

      await reload(auth.currentUser);

      if (!auth.currentUser.emailVerified) {
        throw new Error('Email is still not verified. Please verify and try again.');
      }

      setMessage('Email verified. Redirecting to login...');
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Verification check failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="panel login-panel">
        <h2>Verify Your Email</h2>
        <p>Please verify your email address before accessing protected routes.</p>
        {pendingEmail ? <p className="muted">Pending account: {pendingEmail}</p> : null}

        <div className="stack">
          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <button type="button" className="primary-btn" onClick={handleResend} disabled={loading}>
            {loading ? 'Processing...' : 'Resend Verification Email'}
          </button>

          <button type="button" className="secondary-btn" onClick={handleIHaveVerified} disabled={loading}>
            I Have Verified
          </button>

          <Link to="/login" className="secondary-btn auth-link-btn">Go to Login</Link>
        </div>
      </section>
    </main>
  );
}
