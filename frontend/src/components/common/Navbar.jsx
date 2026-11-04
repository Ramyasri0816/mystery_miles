import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Compass, Sparkles, User, LogOut, CheckCircle2, AlertCircle, Heart, Dices, Menu, X, Compass as PlaneIcon } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import travelService from '../../services/travelService';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    travelService
      .checkHealth()
      .then(() => {
        if (isMounted) setApiStatus('online');
      })
      .catch(() => {
        if (isMounted) setApiStatus('offline');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-badge">
            <Compass size={22} />
          </div>
          <span>Mystery<span className="accent-text">Miles</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Explore
              </NavLink>
            </li>
            <li>
              <NavLink to="/spin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ color: 'var(--coral)' }}>
                <Dices size={16} />
                <span>Mystery Spin</span>
              </NavLink>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <NavLink to="/wishlist" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Heart size={16} color="#e11d48" />
                    <span>Wishlist</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <User size={16} />
                    <span>My Profile</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Actions & Profile / Auth */}
        <div className="nav-actions">
          {/* Real-time API Health Pill */}
          <div
            title={`Backend API is ${apiStatus}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: apiStatus === 'online' ? '#ecfdf5' : '#fef2f2',
              color: apiStatus === 'online' ? '#059669' : '#dc2626',
              border: '1px solid currentColor'
            }}
          >
            {apiStatus === 'online' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            <span>API {apiStatus}</span>
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  background: 'var(--bg-cream-soft)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--surface-border)'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--coral)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
                </div>
                <span>{user?.name?.split(' ')[0] || 'Traveler'}</span>
              </Link>

              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Log out">
                <LogOut size={14} />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/spin" className="btn btn-primary btn-sm">
                <Dices size={14} />
                <span>Spin Mystery</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              display: 'none',
              padding: '0.5rem',
              color: 'var(--text-main)',
              borderRadius: 'var(--radius-sm)'
            }}
            className="mobile-toggle-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--surface-border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Explore All Destinations
          </NavLink>
          <NavLink
            to="/spin"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ color: 'var(--coral)' }}
          >
            <Dices size={16} /> <span>Mystery Spin</span>
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Heart size={16} color="#e11d48" /> <span>My Wishlist</span>
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <User size={16} /> <span>My Profile & History</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                <LogOut size={16} /> <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ flex: 1 }}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
