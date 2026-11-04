import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DiscoveryForm from '../components/discovery/DiscoveryForm';
import DestinationCard from '../components/discovery/DestinationCard';
import travelService from '../services/travelService';
import discoveryService from '../services/discoveryService';
import { Compass, AlertCircle, RefreshCw, Dices, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

export const DiscoverPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [mysteryResult, setMysteryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosticHint, setDiagnosticHint] = useState(null);
  const [currentCriteria, setCurrentCriteria] = useState(null);

  // Standard multi-destination browse
  const handleDiscover = async (preferences) => {
    setLoading(true);
    setError(null);
    setDiagnosticHint(null);
    setMysteryResult(null);

    try {
      const response = await travelService.discoverDestinations({
        budget: preferences.budget,
        availableTimeDays: preferences.durationValue || 4,
        startingLocation: preferences.startingLocation,
        travelStyle: preferences.travelStyle,
        interests: preferences.interests
      });
      setDestinations(response.data?.destinations || []);
      setCurrentCriteria(response.data?.criteria || preferences);
    } catch (err) {
      setError(err.message || 'Failed to load destinations. Check your network or API status.');
    } finally {
      setLoading(false);
    }
  };

  // Signature Feature: Spin the Mystery Destination Matching Engine
  const handleSpinMystery = async (preferences) => {
    setLoading(true);
    setError(null);
    setDiagnosticHint(null);

    try {
      const res = await discoveryService.spinMystery(preferences);
      const data = res.data;

      if (!data.qualified) {
        setDiagnosticHint({
          message: data.helpfulHint,
          adjustments: data.suggestedAdjustments
        });
        setMysteryResult(null);
      } else {
        setMysteryResult(data);
        setDestinations(data.alternativeMatches || []);
        setCurrentCriteria(preferences);
      }
    } catch (err) {
      setError(err.message || 'Failed to spin the mystery matching engine.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial browse on load
  useEffect(() => {
    handleDiscover({
      budget: 15000,
      durationValue: 4,
      durationUnit: 'days',
      startingLocation: 'New Delhi / NCR',
      travelStyle: 'solo',
      interests: ['nature', 'mountain', 'adventure']
    });
  }, []);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="hero-badge" style={{ marginBottom: '0.75rem' }}>
          <Dices size={16} />
          <span>Mystery Destination Matching Engine</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Discover Your Mystery Adventure
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto' }}>
          Enter your budget, available duration, starting city in India, and interests. Our weighted 4-factor algorithm evaluates real destination records to reveal your optimal journey.
        </p>
      </div>

      {/* Discovery & Mystery Form */}
      <DiscoveryForm
        onDiscover={handleDiscover}
        onSpin={handleSpinMystery}
        isLoading={loading}
      />

      {/* Impossible Criteria Diagnostic Banner */}
      {diagnosticHint && (
        <div
          style={{
            padding: '1.5rem',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: 'var(--radius-md)',
            color: '#92400e',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem' }}>
            <AlertCircle size={20} color="#b45309" />
            <span>Adjustment Needed</span>
          </div>
          <p style={{ lineHeight: 1.6 }}>{diagnosticHint.message}</p>
          {diagnosticHint.adjustments && (
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              <span>
                💡 <strong>Minimum recommended budget:</strong> ₹{diagnosticHint.adjustments.recommendedMinimumBudgetINR?.toLocaleString()}
              </span>
              <span>
                ⏳ <strong>Minimum recommended duration:</strong> {diagnosticHint.adjustments.recommendedMinimumDays} days
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          style={{
            padding: '1rem',
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: 'var(--radius-sm)',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Compass size={44} className="spin" color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Running 4-Factor Weighted Algorithm...
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Evaluating real Indian destination records for budget, transit feasibility, duration, and style synergy.
          </p>
        </div>
      )}

      {/* SIGNATURE MYSTERY DESTINATION REVEAL CARD */}
      {!loading && mysteryResult && mysteryResult.destination && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            color: '#ffffff',
            marginBottom: '3.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(244, 63, 94, 0.2)',
                  color: '#fb7185',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                  border: '1px solid rgba(244, 63, 94, 0.3)'
                }}
              >
                <Dices size={14} />
                <span>Selected Mystery Match</span>
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
                {mysteryResult.destination.name}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', marginTop: '0.25rem' }}>
                {mysteryResult.destination.tagline}
              </p>
            </div>

            {/* Total Match Score Circle */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
                Matching Score
              </span>
              <strong style={{ fontSize: '2.25rem', color: '#38bdf8', fontWeight: 800 }}>
                {mysteryResult.matchScore}%
              </strong>
            </div>
          </div>

          {/* 4-FACTOR WEIGHTED SCORING BREAKDOWN */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Interests (40% Weight)</span>
              <strong style={{ fontSize: '1.35rem', color: '#6ee7b7' }}>
                {mysteryResult.scoreBreakdown?.interestsScore}/100
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Budget (30% Weight)</span>
              <strong style={{ fontSize: '1.35rem', color: '#6ee7b7' }}>
                {mysteryResult.scoreBreakdown?.budgetScore}/100
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Duration (20% Weight)</span>
              <strong style={{ fontSize: '1.35rem', color: '#6ee7b7' }}>
                {mysteryResult.scoreBreakdown?.durationScore}/100
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Travel Style (10% Weight)</span>
              <strong style={{ fontSize: '1.35rem', color: '#6ee7b7' }}>
                {mysteryResult.scoreBreakdown?.travelStyleScore}/100
              </strong>
            </div>
          </div>

          {/* Transparent Matching Reasons */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#38bdf8" />
              <span>Transparent Matching Reasons:</span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {mysteryResult.matchingReasons?.map((reason, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Financial Breakdown & CTA */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Estimated Trip Cost</span>
              <strong style={{ fontSize: '1.4rem', color: '#f8fafc' }}>
                ₹{mysteryResult.costEstimate?.totalEstimatedCostINR?.toLocaleString()}
              </strong>
              {mysteryResult.costEstimate?.savingsRemainingINR > 0 && (
                <span style={{ fontSize: '0.85rem', color: '#34d399', display: 'block' }}>
                  ₹{mysteryResult.costEstimate?.savingsRemainingINR?.toLocaleString()} savings cushion left
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                to={`/destinations/${mysteryResult.destination._id}`}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.75rem' }}
              >
                <span>View Full Itinerary Guide</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Top Matches Section */}
      {!loading && destinations.length > 0 && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {mysteryResult ? 'Alternative Top Candidates' : `Recommended Matches (${destinations.length})`}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Other high-compatibility destinations evaluated by the matching engine.
            </p>
          </div>

          <div className="destinations-grid">
            {destinations.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
