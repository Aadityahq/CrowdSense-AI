import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, hasFirebaseConfig } from '../firebase';

export default function Signup() {
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

      if (!hasFirebaseConfig || !auth || !db) {
        throw new Error('Firebase is not configured. Add VITE_FIREBASE_* values in client/.env');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      await setDoc(doc(db, 'users', createdUser.uid), {
        uid: createdUser.uid,
        name,
        email: createdUser.email || email,
        role: 'USER',
        createdAt: new Date().toISOString(),
      });

      setMessage('Signup successful. You can login now.');
      setName('');
      setEmail('');
      setPassword('');
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
        <p>Create an attendee account. Organizer and admin roles are managed securely by admins.</p>

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
