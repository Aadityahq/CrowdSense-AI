import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleReset(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      setMessage('');

      if (!hasFirebaseConfig || !auth) {
        throw new Error('Firebase is not configured. Add VITE_FIREBASE_* values in client/.env');
      }

      const normalizedEmail = email.trim();
      if (!normalizedEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }

      await sendPasswordResetEmail(auth, normalizedEmail);
      setMessage('Reset link sent! Check your email inbox and spam folder.');
      setEmail('');
    } catch (requestError) {
      const code = requestError?.code || '';

      if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error while contacting Firebase. Check your connection and config.');
      } else {
        setError(requestError?.message || 'Could not send reset email.');
      }

      console.error('Password reset failed', {
        code: requestError?.code || 'unknown',
        message: requestError?.message || 'unknown',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="panel login-panel auth-panel">
        <h2>Forgot Password</h2>
        <p>Enter your email and we will send a reset link through Firebase Authentication.</p>

        <div className="auth-hint-card" role="status" aria-live="polite">
          <strong>What happens next</strong>
          <p>We send a reset link to your inbox. Open the email and follow Firebase’s password reset instructions.</p>
        </div>

        <form className="stack" onSubmit={handleReset}>
          <label className="field">
            Email
            <input
              type="email"
              placeholder="you@example.com"
              className="login-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <div className="login-actions">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="return-card">
            <p>Remembered your password?</p>
            <Link to="/login" className="secondary-btn auth-link-btn return-link-btn">Back to Login</Link>
          </div>
        </form>
      </section>
    </main>
  );
}