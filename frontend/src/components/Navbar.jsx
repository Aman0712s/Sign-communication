import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const navLinks = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/text-to-sign', label: 'Text → Sign', icon: '✋' },
  { path: '/sign-to-text', label: 'Sign → Text', icon: '📝' },
  { path: '/about', label: 'About', icon: 'ℹ️' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner container">
        {/* Brand */}
        <NavLink to="/" className="navbar__brand" id="nav-brand">
          <span className="navbar__logo">🤟</span>
          <span className="navbar__name">
            Sign<span className="navbar__name--accent">Comm</span>
          </span>
        </NavLink>

        {/* Desktop Links */}
        <ul className="navbar__links" id="nav-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                }
                id={`nav-${link.label.toLowerCase().replace(/[^a-z]/g, '-')}`}
              >
                <span className="navbar__link-icon">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {token ? (
            <>
              <span className="navbar__user" style={{ marginRight: '1rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👤</span> {username}
              </span>
              <button onClick={handleLogout} className="btn btn--ghost" id="nav-logout">
                Log Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn--ghost" id="nav-login">
                Log In
              </NavLink>
              <NavLink to="/signup" className="btn btn--primary" id="nav-signup">
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="nav-hamburger"
          style={{ zIndex: 1001 }}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="navbar__mobile" id="nav-mobile-menu">
          <ul>
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="navbar__mobile-actions">
              {token ? (
                <>
                  <div className="navbar__mobile-user" style={{ padding: '0.5rem 1rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <span>👤</span> {username}
                  </div>
                  <button onClick={handleLogout} className="btn btn--secondary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="btn btn--secondary" onClick={() => setMobileOpen(false)}>
                    Log In
                  </NavLink>
                  <NavLink to="/signup" className="btn btn--primary" onClick={() => setMobileOpen(false)}>
                    Sign Up
                  </NavLink>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
