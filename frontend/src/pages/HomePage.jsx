import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DestinationCard from '../components/discovery/DestinationCard';
import travelService from '../services/travelService';
import {
  Compass,
  Dices,
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Clock,
  Heart,
  MapPin,
  Mountain,
  Palmtree,
  Landmark,
  Flame,
  Trees,
  SunMedium,
  Footprints
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Hill Station', icon: Mountain, color: '#0284c7', bg: '#e0f2fe', tag: 'Hill Station' },
  { name: 'Beach', icon: Palmtree, color: '#00a896', bg: '#e6f7f5', tag: 'Beach' },
  { name: 'Heritage', icon: Landmark, color: '#f59e0b', bg: '#fef3c7', tag: 'Heritage' },
  { name: 'Spiritual', icon: Flame, color: '#ff7a00', bg: '#fff4eb', tag: 'Spiritual' },
  { name: 'Wildlife', icon: Footprints, color: '#10b981', bg: '#ecfdf5', tag: 'Wildlife' },
  { name: 'Adventure', icon: Compass, color: '#ff5a5f', bg: '#fff0f0', tag: 'Adventure' },
  { name: 'Nature', icon: Trees, color: '#059669', bg: '#d1fae5', tag: 'Nature' },
  { name: 'Desert', icon: SunMedium, color: '#d97706', bg: '#fef3c7', tag: 'Desert' }
];

export const HomePage = () => {
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    travelService
      .getAllDestinations()
      .then((res) => {
        if (isMounted) {
          const list = res.data?.destinations || [];
          setFeaturedDestinations(list.slice(0, 6));
        }
      })
      .catch((err) => console.warn('Failed to load featured destinations:', err.message))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-pill">
            <Sparkles size={16} />
            <span>Serendipitous Travel Powered by 4-Factor Matching</span>
          </div>

          <h1 className="hero-title">
            Stop Scrolling in Endless Loops. <br />
            Spin and Reveal Your <span className="hero-highlight">Mystery Destination</span>.
          </h1>

          <p className="hero-subtitle">
            Input your budget, available days, and starting city in India. Our transparent 4-factor algorithm evaluates real Indian destinations to unlock your personalized getaway.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/spin" className="btn btn-primary btn-lg">
              <Dices size={20} />
              <span>🎲 Spin Mystery Destination</span>
            </Link>
            <Link to="/explore" className="btn btn-outline btn-lg">
              <Search size={18} />
              <span>Explore All Destinations</span>
            </Link>
          </div>
        </div>
      </section>

      {/* POPULAR TRAVEL CATEGORIES */}
      <section style={{ padding: '3rem 0', background: 'var(--bg-cream)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Curated Themes
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                Browse by Travel Category
              </h2>
            </div>
            <Link to="/explore" style={{ color: 'var(--coral)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.95rem' }}>
              View All 27+ Places <ArrowRight size={16} />
            </Link>
          </div>

          <div className="category-chips-bar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.tag)}`)}
                  className="category-chip"
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} />
                  </div>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section style={{ padding: '3.5rem 0 4.5rem', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--turquoise)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Top Rated Escapes
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              Handpicked Indian Gems
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Every location includes authentic descriptions, realistic daily budgets, verified stay durations, and high-res imagery.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <Compass size={40} className="spin" color="var(--coral)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading authentic destination records...</p>
            </div>
          ) : (
            <div className="destinations-grid">
              {featuredDestinations.map((dest) => (
                <DestinationCard key={dest._id} destination={dest} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link to="/explore" className="btn btn-outline" style={{ padding: '0.8rem 2.2rem', fontSize: '1rem' }}>
              Browse Complete Directory of 27 Destinations <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW MYSTERYMILES WORKS */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-cream-soft)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Intelligent Serendipity
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              How the Matching Engine Works
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '620px', margin: '0.5rem auto 0' }}>
              No arbitrary rankings or fake estimates. A mathematical 4-factor scoring algorithm engineered for travelers.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.25rem',
                border: '1.5px solid var(--surface-border)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'var(--coral-light)',
                  color: 'var(--coral)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: 800
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Set Your Boundaries
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Provide your total budget in ₹, available days or hours, and starting Indian transit hub. Destinations exceeding your limits are immediately filtered out.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.25rem',
                border: '1.5px solid var(--surface-border)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'var(--ocean-light)',
                  color: 'var(--ocean)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: 800
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                4-Factor Scoring
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Every candidate is evaluated: <strong>40%</strong> Interest Match, <strong>30%</strong> Budget Efficiency, <strong>20%</strong> Duration Fit, and <strong>10%</strong> Travel Style Synergy.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.25rem',
                border: '1.5px solid var(--surface-border)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'var(--mint-light)',
                  color: 'var(--turquoise)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: 800
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Serendipitous Reveal
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                The engine draws serendipitously from the highest-ranked tier, avoiding places you’ve recently visited, and delivers transparent matching reasons and budget breakdown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '4.5rem 0', background: 'var(--gradient-card-dark)', color: '#ffffff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready for an Unforgettable Escape?
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1.15rem', marginBottom: '2.25rem' }}>
            Join thousands of travelers exploring India’s hidden gems without the headache of planning.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/spin" className="btn btn-primary btn-lg">
              <Dices size={20} />
              <span>Spin Mystery Destination</span>
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', background: 'transparent' }}>
              Create Traveler Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
