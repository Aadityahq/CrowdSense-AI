import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, hasFirebaseConfig } from '../firebase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function redirectByRole(role) {
    const target = role === 'ADMIN' ? '/admin' : role === 'ORGANIZER' ? '/organizer' : '/map';
    navigate(target, { replace: true });
  }

  async function createUserIfNotExists(user) {
    const profileRef = doc(db, 'users', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      return profileSnap.data();
    }

    const derivedName = (user.displayName || user.email || '').split('@')[0] || 'Attendee';

    const payload = {
      uid: user.uid,
      name: derivedName,
      email: user.email || '',
      role: 'USER',
      createdAt: new Date().toISOString(),
    };

    await setDoc(profileRef, payload);
    return payload;
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      setMessage('');

      if (!hasFirebaseConfig || !auth || !db) {
        throw new Error('Firebase is not configured. Add VITE_FIREBASE_* values in client/.env');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const signedInUser = userCredential.user || auth.currentUser;

      if (!signedInUser) {
        throw new Error('Could not resolve authenticated user session. Please retry.');
      }

      if (!signedInUser.emailVerified) {
        await sendEmailVerification(signedInUser);
        setMessage('Please verify your email before logging in. We sent a fresh verification link.');
        navigate('/verify-email', {
          replace: true,
          state: { email: signedInUser.email || email },
        });
        return;
      }

      await createUserIfNotExists(signedInUser);

      const uidProfileRef = doc(db, 'users', signedInUser.uid);
      const uidProfileSnap = await getDoc(uidProfileRef);

      // Backward compatibility for older profiles keyed by email.
      let role = 'USER';
      if (uidProfileSnap.exists()) {
        role = uidProfileSnap.data().role || 'USER';
      } else {
        const legacyProfileRef = doc(db, 'users', signedInUser.email || email);
        const legacyProfileSnap = await getDoc(legacyProfileRef);
        if (legacyProfileSnap.exists()) {
          role = legacyProfileSnap.data().role || 'USER';
        }
      }

      localStorage.setItem('role', role);
      localStorage.setItem('crowdsense_user', JSON.stringify({ email: signedInUser.email || email, role }));
      setMessage('Login successful. Redirecting...');
      redirectByRole(role);
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="panel login-panel">
        <h2>Login</h2>
        <p>Sign in with Firebase Authentication and redirect by Firestore role.</p>
        <p className="auth-security-note">Secure access: Email verification required</p>

        <form className="stack" onSubmit={handleLogin}>
          <label className="field">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              className="login-input"
              required
            />
          </label>

          <label className="field">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              type="password"
              className="login-input"
              required
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <div className="login-actions">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
            <Link to="/signup" className="secondary-btn auth-link-btn">Create account</Link>
          </div>
        </form>
      </section>
    </main>
  );
}