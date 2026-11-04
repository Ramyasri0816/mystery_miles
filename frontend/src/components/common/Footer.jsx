import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Sparkles, MapPin, ShieldCheck, Dices } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '1.4rem', fontWeight: 800 }}>
              <div className="brand-badge">
                <Compass size={20} />
              </div>
              <span>Mystery<span style={{ color: 'var(--coral)' }}>Miles</span></span>
            </Link>
            <p>
              Serendipitous travel discovery platform powered by intelligent 4-factor multi-attribute matching across 27+ authentic Indian destinations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">Discover</h4>
            <ul className="footer-links">
              <li><Link to="/explore">Explore All Places</Link></li>
              <li><Link to="/spin">Mystery Spin Engine</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/profile">Traveler Profile</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-heading">Popular Themes</h4>
            <ul className="footer-links">
              <li><Link to="/explore?category=Hill%20Station">Hill Stations</Link></li>
              <li><Link to="/explore?category=Beach">Beach Getaways</Link></li>
              <li><Link to="/explore?category=Heritage">Royal Heritage</Link></li>
              <li><Link to="/explore?category=Spiritual">Spiritual Retreats</Link></li>
              <li><Link to="/explore?category=Adventure">Adventure Trails</Link></li>
            </ul>
          </div>

          {/* Technology & Trust */}
          <div>
            <h4 className="footer-heading">Architecture</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Built with React, Vite, Express.js, MongoDB Atlas, Mongoose, Zod & JWT.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: 'var(--mint-light)', color: 'var(--turquoise)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700 }}>
              <ShieldCheck size={14} /> Verified Real Indian Data
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MysteryMiles. All rights reserved. Crafted for memorable journeys.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/explore">Privacy</Link>
            <Link to="/explore">Terms</Link>
            <Link to="/explore">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
