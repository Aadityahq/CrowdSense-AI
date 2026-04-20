import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../firebase';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSignup(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      setMessage('');

      if (!hasFirebaseConfig || !auth) {
        throw new Error('Firebase is not configured. Add VITE_FIREBASE_* values in client/.env');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      await sendEmailVerification(createdUser);

      setMessage('Account created. Verification email sent.');
      setName('');
      setEmail('');
      setPassword('');
      navigate('/verify-email', { replace: true, state: { email: createdUser.email || email, name } });
    } catch (requestError) {
      setError(requestError.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="panel login-panel">
        <h2>Sign Up</h2>
        <p>Create an attendee account and verify your email before first login.</p>

        <form className="stack" onSubmit={handleSignup}>
          <label className="field">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} className="login-input" required />
          </label>

          <label className="field">
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="login-input" type="email" required />
          </label>

          <label className="field">
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} className="login-input" type="password" required />
          </label>

          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <div className="auth-hint-card" role="status" aria-live="polite">
            <strong>After signup:</strong>
            <p>Account created -&gt; Verification email sent -&gt; Verify to continue.</p>
          </div>

          <div className="login-actions">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
            <Link to="/login" className="secondary-btn auth-link-btn">Go to Login</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
