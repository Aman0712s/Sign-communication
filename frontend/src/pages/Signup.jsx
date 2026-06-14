import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !password2) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/auth/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        navigate('/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed. Try a different username.');
      }
    } catch {
      // For now, navigate to login (auth API not yet implemented)
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth">
      <div className="auth__container">
        <div className="auth__card glass-card animate-fade-in-up" id="signup-card">
          <div className="auth__header">
            <span className="auth__icon">✨</span>
            <h1>Create Account</h1>
            <p>Join SignComm and start communicating</p>
          </div>

          {error && <div className="auth__error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth__form">
            <div className="auth__field">
              <label htmlFor="signup-username">Username</label>
              <input
                type="text"
                id="signup-username"
                className="input"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="auth__field">
              <label htmlFor="signup-password">Password</label>
              <input
                type="password"
                id="signup-password"
                className="input"
                placeholder="Create a password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="auth__field">
              <label htmlFor="signup-password2">Confirm Password</label>
              <input
                type="password"
                id="signup-password2"
                className="input"
                placeholder="Confirm your password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--lg auth__submit"
              disabled={loading}
              id="signup-submit"
            >
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div className="auth__footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
