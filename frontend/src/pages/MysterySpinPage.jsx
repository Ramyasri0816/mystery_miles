import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DiscoveryForm from '../components/discovery/DiscoveryForm';
import DestinationCard from '../components/discovery/DestinationCard';
import discoveryService from '../services/discoveryService';
import savedTripService from '../services/savedTripService';
import useAuth from '../hooks/useAuth';
import {
  Compass,
  AlertCircle,
  RefreshCw,
  Dices,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Heart,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';

const SUSPENSE_MESSAGES = [
  'Inspecting verified Indian destination records...',
  'Eliminating out-of-budget destinations...',
  'Verifying starting-hub transit feasibility...',
  'Calculating 4-factor compatibility weights...',
  'Selecting an optimal hidden gem from top-ranked tier...'
];

export const MysterySpinPage = () => {
  const { isAuthenticated } = useAuth();

  const [mysteryResult, setMysteryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suspensePhase, setSuspensePhase] = useState(false);
  const [suspenseTextIndex, setSuspenseTextIndex] = useState(0);
  const [error, setError] = useState(null);
  const [diagnosticHint, setDiagnosticHint] = useState(null);
  const [currentPreferences, setCurrentPreferences] = useState({
    budget: 18000,
    durationValue: 4,
    durationUnit: 'days',
    startingLocation: 'New Delhi / NCR',
    travelStyle: 'solo',
    interests: ['nature', 'mountain', 'adventure']
  });

  // Saved in wishlist state
  const [savedWishlist, setSavedWishlist] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);

  // Suspense text cycling effect
  useEffect(() => {
    let interval;
    if (suspensePhase) {
      interval = setInterval(() => {
        setSuspenseTextIndex((prev) => (prev + 1) % SUSPENSE_MESSAGES.length);
      }, 450);
    }
    return () => clearInterval(interval);
  }, [suspensePhase]);

  // Execute Spin with Suspense Animation
  const handleSpinMystery = async (preferences) => {
    setCurrentPreferences(preferences);
    setLoading(true);
    setSuspensePhase(true);
    setError(null);
    setDiagnosticHint(null);
    setSavedWishlist(false);

    try {
      // Run API call in parallel with minimum suspense duration (1.2 seconds)
      const [apiResponse] = await Promise.all([
        discoveryService.spinMystery(preferences),
        new Promise((resolve) => setTimeout(resolve, 1400))
      ]);

      const data = apiResponse.data?.data || apiResponse.data;

      if (!data.qualified) {
        setDiagnosticHint({
          message: data.helpfulHint,
          adjustments: data.suggestedAdjustments
        });
        setMysteryResult(null);
      } else {
        setMysteryResult(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to spin the mystery matching engine.');
    } finally {
      setLoading(false);
      setSuspensePhase(false);
    }
  };

  // Quick Spin Again with existing criteria
  const handleSpinAgain = () => {
    handleSpinMystery(currentPreferences);
  };

  // 1-Click Save revealed destination to Wishlist
  const handleSaveToWishlist = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save this mystery destination to your wishlist!');
      return;
    }
    if (!mysteryResult?.destination?._id) return;

    setSavingWishlist(true);
    try {
      await savedTripService.saveTrip({
        destinationId: mysteryResult.destination._id,
        notes: `Discovered via Mystery Spin with ${mysteryResult.matchScore}% match score!`
      });
      setSavedWishlist(true);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already')) {
        setSavedWishlist(true);
      } else {
        alert(err.message || 'Could not save to wishlist');
      }
    } finally {
      setSavingWishlist(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="hero-badge" style={{ marginBottom: '0.85rem' }}>
          <Dices size={16} />
          <span>Signature Travel Discovery</span>
        </div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Mystery Destination <span className="accent-text">Spin</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem' }}>
          Set your budget, available duration, starting Indian city, and travel interests.
          Our transparent 4-factor matching engine evaluates real destinations and reveals your next unforgettable adventure.
        </p>
      </div>

      {/* Interactive Preference Form */}
      <div style={{ maxWidth: '960px', margin: '0 auto 3rem' }}>
        <DiscoveryForm
          initialValues={currentPreferences}
          onSpin={handleSpinMystery}
          onDiscover={handleSpinMystery}
          isLoading={loading}
        />
      </div>

      {/* SUSPENSE SPINNING ANIMATION */}
      {suspensePhase && (
        <div className="suspense-box" style={{ maxWidth: '850px', margin: '0 auto 3.5rem' }}>
          <div className="dice-spin" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--coral)' }}>
            <Compass size={64} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Analyzing Destinations...
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--coral)', fontWeight: 600, minHeight: '30px' }}>
            {SUSPENSE_MESSAGES[suspenseTextIndex]}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--coral)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--orange)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--turquoise)' }} />
          </div>
        </div>
      )}

      {/* Impossible Criteria Diagnostic Banner */}
      {diagnosticHint && !loading && (
        <div
          style={{
            maxWidth: '850px',
            margin: '0 auto 3rem',
            padding: '1.75rem',
            background: '#fffbeb',
            border: '2px solid #fef3c7',
            borderRadius: 'var(--radius-lg)',
            color: '#92400e',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.15rem' }}>
            <AlertCircle size={22} color="#b45309" />
            <span>Adjustment Recommended</span>
          </div>
          <p style={{ marginTop: '0.5rem', lineHeight: 1.6, fontSize: '0.98rem' }}>{diagnosticHint.message}</p>
          {diagnosticHint.adjustments && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #fde68a',
                fontSize: '0.95rem'
              }}
            >
              <span>
                💡 <strong>Minimum viable budget:</strong> ₹
                {diagnosticHint.adjustments.recommendedMinimumBudgetINR?.toLocaleString()}
              </span>
              <span>
                ⏳ <strong>Minimum viable duration:</strong> {diagnosticHint.adjustments.recommendedMinimumDays} days
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && !loading && (
        <div
          style={{
            maxWidth: '850px',
            margin: '0 auto 2.5rem',
            padding: '1.25rem',
            background: '#fef2f2',
            border: '1.5px solid #fee2e2',
            borderRadius: 'var(--radius-md)',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* REVEALED MYSTERY DESTINATION CARD */}
      {!loading && mysteryResult && mysteryResult.destination && (
        <div className="mystery-reveal-box" style={{ maxWidth: '960px', margin: '0 auto 4rem' }}>
          {/* Top Banner & Match Score Pill */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 90, 95, 0.25)',
                  color: '#fda4af',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.85rem',
                  border: '1px solid rgba(255, 90, 95, 0.4)'
                }}
              >
                <Sparkles size={15} />
                <span>🎉 Mystery Destination Unlocked</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                {mysteryResult.destination.name}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#38bdf8" />
                <span>{mysteryResult.destination.state}, India</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                <span style={{ color: '#38bdf8' }}>{mysteryResult.destination.category}</span>
              </p>
            </div>

            {/* Match Score Badge */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 2rem',
                textAlign: 'center',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', fontWeight: 800, letterSpacing: '0.05em' }}>
                Engine Match Score
              </span>
              <strong style={{ fontSize: '2.75rem', color: '#38bdf8', fontWeight: 900, lineHeight: 1.1 }}>
                {mysteryResult.matchScore}%
              </strong>
            </div>
          </div>

          {/* Hero Photography & Tagline */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: '2rem',
              height: '320px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <img
              src={mysteryResult.destination.imageUrl}
              alt={mysteryResult.destination.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1.5rem',
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)'
              }}
            >
              <p style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: 600, fontStyle: 'italic' }}>
                "{mysteryResult.destination.tagline}"
              </p>
            </div>
          </div>

          {/* 4-FACTOR WEIGHTED SCORING BREAKDOWN */}
          <div style={{ marginBottom: '2.25rem' }}>
            <h3
              style={{
                fontSize: '0.9rem',
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 800,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Award size={16} color="#38bdf8" />
              <span>Transparent 4-Factor Weighted Scoring Breakdown</span>
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}
            >
              {/* Factor 1: Interests */}
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '1.1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Interests Synergy (40%)</span>
                  <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>
                    {mysteryResult.scoreBreakdown?.interestsScore}/100
                  </strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${mysteryResult.scoreBreakdown?.interestsScore || 0}%`,
                      height: '100%',
                      background: '#34d399',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>

              {/* Factor 2: Budget */}
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '1.1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Budget Buffer (30%)</span>
                  <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>
                    {mysteryResult.scoreBreakdown?.budgetScore}/100
                  </strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${mysteryResult.scoreBreakdown?.budgetScore || 0}%`,
                      height: '100%',
                      background: '#38bdf8',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>

              {/* Factor 3: Duration */}
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '1.1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Duration Fit (20%)</span>
                  <strong style={{ color: '#fcd34d', fontSize: '0.95rem' }}>
                    {mysteryResult.scoreBreakdown?.durationScore}/100
                  </strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${mysteryResult.scoreBreakdown?.durationScore || 0}%`,
                      height: '100%',
                      background: '#fcd34d',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>

              {/* Factor 4: Travel Style */}
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '1.1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Style Match (10%)</span>
                  <strong style={{ color: '#f472b6', fontSize: '0.95rem' }}>
                    {mysteryResult.scoreBreakdown?.travelStyleScore}/100
                  </strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${mysteryResult.scoreBreakdown?.travelStyleScore || 0}%`,
                      height: '100%',
                      background: '#f472b6',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Reasons */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ShieldCheck size={18} color="#38bdf8" />
              <span>Why This Destination Was Chosen For You:</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {mysteryResult.matchingReasons?.map((reason, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    color: '#e2e8f0',
                    fontSize: '0.96rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown & Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              paddingTop: '1.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            {/* Cost metrics */}
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Estimated Trip Budget
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.2rem' }}>
                <strong style={{ fontSize: '1.75rem', color: '#ffffff', fontWeight: 800 }}>
                  ₹{mysteryResult.costEstimate?.totalEstimatedCostINR?.toLocaleString()}
                </strong>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  (₹{mysteryResult.costEstimate?.dailyCostINR?.toLocaleString()} / day)
                </span>
              </div>
              {mysteryResult.costEstimate?.savingsRemainingINR > 0 && (
                <span style={{ fontSize: '0.88rem', color: '#34d399', fontWeight: 600, display: 'block', marginTop: '0.2rem' }}>
                  ₹{mysteryResult.costEstimate?.savingsRemainingINR?.toLocaleString()} buffer remaining in your budget
                </span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSpinAgain}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  padding: '0.85rem 1.4rem'
                }}
              >
                <Dices size={18} />
                <span>Spin Again</span>
              </button>

              <button
                type="button"
                className="btn"
                onClick={handleSaveToWishlist}
                disabled={savingWishlist}
                style={{
                  background: savedWishlist ? '#10b981' : 'rgba(244, 63, 94, 0.2)',
                  color: savedWishlist ? '#ffffff' : '#fb7185',
                  borderColor: savedWishlist ? '#10b981' : 'rgba(244, 63, 94, 0.4)',
                  padding: '0.85rem 1.4rem'
                }}
              >
                <Heart size={18} fill={savedWishlist ? 'currentColor' : 'none'} />
                <span>{savedWishlist ? 'Saved in Wishlist!' : 'Save to Wishlist'}</span>
              </button>

              <Link
                to={`/destinations/${mysteryResult.destination._id}`}
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.6rem' }}
              >
                <span>View Full Itinerary</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Top Candidates */}
      {!loading && mysteryResult && mysteryResult.alternativeMatches?.length > 0 && (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Alternative Top Candidates</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Other highly compatible destinations identified by the 4-factor matching algorithm.
              </p>
            </div>
          </div>

          <div className="destinations-grid">
            {mysteryResult.alternativeMatches.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MysterySpinPage;
