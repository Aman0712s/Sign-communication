import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual Django auth API call
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        navigate('/text-to-sign');
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      // For now, just navigate (auth API not yet implemented)
      navigate('/text-to-sign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth">
      <div className="auth__container">
        <div className="auth__card glass-card animate-fade-in-up" id="login-card">
          <div className="auth__header">
            <span className="auth__icon">🤟</span>
            <h1>Welcome Back</h1>
            <p>Sign in to continue to SignComm</p>
          </div>

          {error && <div className="auth__error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth__form">
            <div className="auth__field">
              <label htmlFor="login-username">Username</label>
              <input
                type="text"
                id="login-username"
                className="input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="auth__field">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--lg auth__submit"
              disabled={loading}
              id="login-submit"
            >
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="auth__footer">
            Don&apos;t have an account?{' '}
            <Link to="/signup">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
