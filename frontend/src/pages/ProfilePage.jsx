import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import discoveryService from '../services/discoveryService';
import savedTripService from '../services/savedTripService';
import {
  User,
  Settings,
  Heart,
  Dices,
  MapPin,
  Clock,
  DollarSign,
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ArrowRight,
  Edit3,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
];

const INTEREST_OPTIONS = [
  'Nature',
  'Culture',
  'Adventure',
  'Food',
  'Relaxation',
  'Beach',
  'Mountain',
  'Wildlife',
  'Spiritual',
  'History'
];

const POPULAR_INDIAN_HUBS = [
  'New Delhi / NCR',
  'Mumbai',
  'Bengaluru',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Kochi',
  'Goa',
  'Chandigarh',
  'Lucknow',
  'Guwahati'
];

export const ProfilePage = () => {
  const { user, updateProfile, updatePreferences } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'preferences' | 'history' | 'editProfile'
  const [history, setHistory] = useState([]);
  const [savedTrips, setSavedTrips] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Travel Preferences Form State
  const [prefLocation, setPrefLocation] = useState(user?.travelPreferences?.startingLocation || 'New Delhi / NCR');
  const [prefBudgetTier, setPrefBudgetTier] = useState(user?.travelPreferences?.budgetTier || 'any');
  const [prefStyle, setPrefStyle] = useState(user?.travelPreferences?.preferredStyle || 'solo');
  const [prefDuration, setPrefDuration] = useState(user?.travelPreferences?.preferredDurationDays || 4);
  const [prefInterests, setPrefInterests] = useState(user?.travelPreferences?.interests || ['nature', 'mountain']);
  const [savingPref, setSavingPref] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState('');
  const [prefError, setPrefError] = useState('');

  // Synchronize initial state when user loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || AVATAR_OPTIONS[0]);
      if (user.travelPreferences) {
        setPrefLocation(user.travelPreferences.startingLocation || 'New Delhi / NCR');
        setPrefBudgetTier(user.travelPreferences.budgetTier || 'any');
        setPrefStyle(user.travelPreferences.preferredStyle || 'solo');
        setPrefDuration(user.travelPreferences.preferredDurationDays || 4);
        setPrefInterests(user.travelPreferences.interests || ['nature', 'mountain']);
      }
    }
  }, [user]);

  // Load Discovery History & Saved Trips stats
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const historyRes = await discoveryService.getDiscoveryHistory();
        setHistory(historyRes.data?.data?.history || historyRes.data?.history || []);
      } catch (e) {
        console.warn('Could not load discovery history:', e.message);
      } finally {
        setLoadingHistory(false);
      }

      try {
        const tripsRes = await savedTripService.getMySavedTrips();
        setSavedTrips(tripsRes.data?.savedTrips || []);
      } catch (e) {
        console.warn('Could not load saved trips:', e.message);
      } finally {
        setLoadingTrips(false);
      }
    };

    loadUserData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      await updateProfile({ name: name.trim(), bio: bio.trim(), avatar });
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setSavingPref(true);
    setPrefSuccess('');
    setPrefError('');

    try {
      await updatePreferences({
        startingLocation: prefLocation.trim(),
        budgetTier: prefBudgetTier,
        preferredStyle: prefStyle,
        preferredDurationDays: Number(prefDuration),
        interests: prefInterests
      });
      setPrefSuccess('Travel preferences saved successfully!');
    } catch (err) {
      setPrefError(err.message || 'Failed to save travel preferences');
    } finally {
      setSavingPref(false);
    }
  };

  const toggleInterest = (interest) => {
    const lower = interest.toLowerCase();
    if (prefInterests.includes(lower)) {
      setPrefInterests(prefInterests.filter((i) => i !== lower));
    } else {
      setPrefInterests([...prefInterests, lower]);
    }
  };

  // Travel Statistics Calculations
  const visitedCount = savedTrips.filter((t) => t.visitedStatus === 'visited').length;
  const bestScore = history.length > 0 ? Math.max(...history.map((h) => h.matchScore || 0)) : null;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* User Header Profile Card */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1.5px solid var(--surface-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
          <img
            src={avatar}
            alt={user?.name || 'Traveler'}
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--coral)',
              boxShadow: 'var(--shadow-md)'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = AVATAR_OPTIONS[0];
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{user?.name || 'Travel Explorer'}</h1>
              <span
                style={{
                  background: 'var(--coral-light)',
                  color: 'var(--coral)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.05em'
                }}
              >
                {user?.role === 'admin' ? 'Administrator' : 'Traveler'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              {user?.email}
            </p>
            {user?.bio ? (
              <p style={{ marginTop: '0.65rem', color: 'var(--text-main)', fontSize: '0.95rem', maxWidth: '500px' }}>
                "{user.bio}"
              </p>
            ) : (
              <p style={{ marginTop: '0.4rem', color: 'var(--text-light)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                No travel bio added yet. Tell us your wanderlust story!
              </p>
            )}
          </div>
        </div>

        {/* Quick Spin CTA */}
        <div>
          <Link to="/spin" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
            <Dices size={18} />
            <span>Mystery Spin</span>
          </Link>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '2px solid var(--surface-border)',
          marginBottom: '2.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'overview' ? 'var(--coral)' : 'var(--text-muted)',
            borderBottom: activeTab === 'overview' ? '3px solid var(--coral)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Award size={18} />
          <span>Stats & Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'preferences' ? 'var(--coral)' : 'var(--text-muted)',
            borderBottom: activeTab === 'preferences' ? '3px solid var(--coral)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Settings size={18} />
          <span>Travel Preferences</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'history' ? 'var(--coral)' : 'var(--text-muted)',
            borderBottom: activeTab === 'history' ? '3px solid var(--coral)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Compass size={18} />
          <span>Discovery History ({history.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('editProfile')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'editProfile' ? 'var(--coral)' : 'var(--text-muted)',
            borderBottom: activeTab === 'editProfile' ? '3px solid var(--coral)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Edit3 size={18} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & TRAVEL STATS */}
      {activeTab === 'overview' && (
        <div>
          {/* 4 Stats Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}
          >
            {/* Stat 1: Total Mystery Spins */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                border: '1.5px solid var(--surface-border)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Mystery Spins</span>
                <div style={{ background: 'var(--coral-light)', padding: '0.45rem', borderRadius: 'var(--radius-md)', color: 'var(--coral)' }}>
                  <Dices size={20} />
                </div>
              </div>
              <strong style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {loadingHistory ? '...' : history.length}
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Destinations uncovered by the matching engine
              </p>
            </div>

            {/* Stat 2: Wishlist Places */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                border: '1.5px solid var(--surface-border)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Saved Wishlist</span>
                <div style={{ background: '#ffe4e6', padding: '0.45rem', borderRadius: 'var(--radius-md)', color: '#f43f5e' }}>
                  <Heart size={20} />
                </div>
              </div>
              <strong style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {loadingTrips ? '...' : savedTrips.length}
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Places earmarked for your future escapes
              </p>
            </div>

            {/* Stat 3: Places Visited */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                border: '1.5px solid var(--surface-border)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Places Visited</span>
                <div style={{ background: '#ecfdf5', padding: '0.45rem', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <strong style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {loadingTrips ? '...' : visitedCount}
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Adventures checked off your travel bucket list
              </p>
            </div>

            {/* Stat 4: Best Match Score */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                border: '1.5px solid var(--surface-border)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Best Algorithm Fit</span>
                <div style={{ background: '#e0f2fe', padding: '0.45rem', borderRadius: 'var(--radius-md)', color: '#0284c7' }}>
                  <Sparkles size={20} />
                </div>
              </div>
              <strong style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {bestScore ? `${bestScore}%` : '—'}
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Highest compatibility match achieved
              </p>
            </div>
          </div>

          {/* Quick Info & Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Preferred Profile Summary */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                border: '1.5px solid var(--surface-border)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={20} color="var(--coral)" />
                <span>Default Travel Persona</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Starting Hub:</span>
                  <strong>{user?.travelPreferences?.startingLocation || 'New Delhi / NCR'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Travel Style:</span>
                  <strong style={{ textTransform: 'capitalize' }}>{user?.travelPreferences?.preferredStyle || 'Solo'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Budget Tier:</span>
                  <strong style={{ textTransform: 'capitalize' }}>{user?.travelPreferences?.budgetTier || 'Any'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Preferred Duration:</span>
                  <strong>{user?.travelPreferences?.preferredDurationDays || 4} Days</strong>
                </div>
              </div>
            </div>

            {/* Recent Discovery Spotlight */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                border: '1.5px solid var(--surface-border)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Dices size={20} color="var(--orange)" />
                <span>Latest Mystery Discovery</span>
              </h3>
              {history.length > 0 && history[0].destination ? (
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <img
                      src={history[0].destination.imageUrl}
                      alt={history[0].destination.name}
                      style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{history[0].destination.name}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {history[0].destination.state} • {history[0].destination.category}
                      </p>
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: '#0284c7',
                          background: '#e0f2fe',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)'
                        }}
                      >
                        {history[0].matchScore}% Match
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/destinations/${history[0].destination._id}`}
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>View Destination Guide</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    You haven't run any mystery spins yet!
                  </p>
                  <Link to="/spin" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                    Spin Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRAVEL PREFERENCES EDITOR */}
      {activeTab === 'preferences' && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              border: '1.5px solid var(--surface-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              My Travel Preferences
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              These default settings help the Mystery Matching Engine tailor recommendations whenever you explore or spin.
            </p>

            {prefSuccess && (
              <div
                style={{
                  padding: '1rem',
                  background: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  borderRadius: 'var(--radius-sm)',
                  color: '#059669',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Check size={18} />
                <span>{prefSuccess}</span>
              </div>
            )}

            {prefError && (
              <div
                style={{
                  padding: '1rem',
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: 'var(--radius-sm)',
                  color: '#dc2626',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={18} />
                <span>{prefError}</span>
              </div>
            )}

            <form onSubmit={handlePreferencesSubmit}>
              {/* Starting Indian Location */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  <MapPin size={16} color="var(--primary)" />
                  Primary Starting Hub in India
                </label>
                <input
                  list="profile-indian-hubs"
                  type="text"
                  className="form-input"
                  value={prefLocation}
                  onChange={(e) => setPrefLocation(e.target.value)}
                  placeholder="e.g. New Delhi, Mumbai, Bengaluru..."
                />
                <datalist id="profile-indian-hubs">
                  {POPULAR_INDIAN_HUBS.map((hub) => (
                    <option key={hub} value={hub} />
                  ))}
                </datalist>
              </div>

              {/* Preferred Travel Style */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  <Compass size={16} color="var(--primary)" />
                  Preferred Travel Style
                </label>
                <select
                  className="form-select"
                  value={prefStyle}
                  onChange={(e) => setPrefStyle(e.target.value)}
                >
                  <option value="solo">Solo Adventurer</option>
                  <option value="couple">Romantic Couple</option>
                  <option value="family">Family Friendly</option>
                  <option value="backpacker">Backpacker / Budget</option>
                  <option value="luxury">Luxury Comfort</option>
                  <option value="adventure">Action & Adventure</option>
                  <option value="cultural">Culture & Heritage</option>
                  <option value="any">Flexible / Any</option>
                </select>
              </div>

              {/* Budget Tier */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  <DollarSign size={16} color="var(--primary)" />
                  Budget Tier
                </label>
                <select
                  className="form-select"
                  value={prefBudgetTier}
                  onChange={(e) => setPrefBudgetTier(e.target.value)}
                >
                  <option value="any">Flexible (All budgets)</option>
                  <option value="budget">Budget (Economy stays & travel)</option>
                  <option value="mid-range">Mid-Range (Comfort & boutique stays)</option>
                  <option value="luxury">Luxury (Premium resorts & flights)</option>
                </select>
              </div>

              {/* Default Duration */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  <Clock size={16} color="var(--primary)" />
                  Typical Trip Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="form-input"
                  value={prefDuration}
                  onChange={(e) => setPrefDuration(e.target.value)}
                />
              </div>

              {/* Interests Multi-Select Pills */}
              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="form-label">
                  <Sparkles size={16} color="var(--primary)" />
                  Top Travel Interests
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.5rem' }}>
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = prefInterests.includes(interest.toLowerCase());
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)',
                          background: isSelected ? 'var(--coral)' : 'var(--surface-hover)',
                          color: isSelected ? '#ffffff' : 'var(--text-main)',
                          border: isSelected ? '1.5px solid var(--coral)' : '1.5px solid var(--surface-border)'
                        }}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingPref}
                style={{ width: '100%', padding: '0.9rem' }}
              >
                <Save size={18} />
                <span>{savingPref ? 'Saving Preferences...' : 'Save Travel Preferences'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: DISCOVERY HISTORY */}
      {activeTab === 'history' && (
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Mystery Spin History</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Your personal log of destinations chosen by the 4-factor matching engine.
              </p>
            </div>
            <Link to="/spin" className="btn btn-primary">
              <Dices size={16} />
              <span>Spin Again</span>
            </Link>
          </div>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <Compass size={40} className="spin" color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading discovery records...</p>
            </div>
          ) : history.length === 0 ? (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                padding: '4rem 2rem',
                textAlign: 'center',
                border: '1.5px solid var(--surface-border)'
              }}
            >
              <Dices size={56} color="var(--coral)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Mystery Spins Yet</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                Enter your budget, dates, and interests on the Mystery Spin page to discover personalized hidden gems.
              </p>
              <Link to="/spin" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                Launch Mystery Spin
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {history.map((item) => (
                <div
                  key={item._id}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    border: '1.5px solid var(--surface-border)',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <img
                      src={item.destination?.imageUrl}
                      alt={item.destination?.name || 'Destination'}
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                          {item.destination?.name || 'Mystery Gem'}
                        </h3>
                        <span
                          style={{
                            background: '#e0f2fe',
                            color: '#0284c7',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.65rem',
                            borderRadius: 'var(--radius-full)'
                          }}
                        >
                          {item.matchScore}% Match
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {item.destination?.state} • {item.destination?.category}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span>
                          📅 {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {item.searchCriteria?.budgetINR && (
                          <span>💰 Budget: ₹{item.searchCriteria.budgetINR.toLocaleString()}</span>
                        )}
                        {item.searchCriteria?.availableDays && (
                          <span>⏳ {item.searchCriteria.availableDays} Days</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {item.destination?._id ? (
                      <Link
                        to={`/destinations/${item.destination._id}`}
                        className="btn btn-outline"
                        style={{ padding: '0.65rem 1.25rem' }}
                      >
                        <span>View Guide</span>
                        <ArrowRight size={16} />
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Archived Record</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EDIT PROFILE */}
      {activeTab === 'editProfile' && (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              border: '1.5px solid var(--surface-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Edit Traveler Profile
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Update your personal display name, avatar, and travel biography.
            </p>

            {profileSuccess && (
              <div
                style={{
                  padding: '1rem',
                  background: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  borderRadius: 'var(--radius-sm)',
                  color: '#059669',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Check size={18} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div
                style={{
                  padding: '1rem',
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: 'var(--radius-sm)',
                  color: '#dc2626',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={18} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              {/* Avatar Selector */}
              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">Choose Avatar</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {AVATAR_OPTIONS.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Avatar option ${i + 1}`}
                      onClick={() => setAvatar(imgUrl)}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        objectFit: 'cover',
                        border: avatar === imgUrl ? '3px solid var(--coral)' : '2px solid transparent',
                        transform: avatar === imgUrl ? 'scale(1.08)' : 'scale(1)',
                        transition: 'var(--transition-fast)'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Bio */}
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Traveler Bio</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  maxLength={500}
                  placeholder="Share your travel philosophy, dream destinations, or past adventures..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', display: 'block', marginTop: '0.35rem' }}>
                  {bio.length} / 500 characters
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
                style={{ width: '100%', padding: '0.9rem' }}
              >
                <Save size={18} />
                <span>{savingProfile ? 'Updating Profile...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
