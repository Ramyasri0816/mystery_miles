import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, Clock, ArrowRight, Heart } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import savedTripService from '../../services/savedTripService';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

export const DestinationCard = ({ destination }) => {
  const {
    _id,
    name,
    tagline,
    city,
    state,
    country,
    budgetTier,
    estimatedDailyCostINR,
    estimatedDailyCostUSD,
    minDurationDays,
    maxDurationDays,
    imageUrl,
    imageUrls = [],
    matchScore = 85,
    interests = []
  } = destination;

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Resolve primary image with fallbacks
  const primaryImage = imageUrl || (imageUrls && imageUrls.length > 0 ? imageUrls[0] : FALLBACK_IMAGE);
  const [imgSrc, setImgSrc] = useState(primaryImage);

  const displayLocation = [city, state, country].filter(Boolean).slice(0, 2).join(', ');
  const dailyCost = estimatedDailyCostINR
    ? `₹${estimatedDailyCostINR.toLocaleString()}`
    : `$${estimatedDailyCostUSD || 50}`;

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      if (!isSaved) {
        await savedTripService.saveTrip({ destinationId: _id });
        setIsSaved(true);
      }
    } catch (err) {
      // 409 means already saved
      if (err.message && err.message.includes('already')) {
        setIsSaved(true);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="destination-card">
      <div className="card-image-wrap">
        <img
          src={imgSrc}
          alt={name}
          className="card-image"
          loading="lazy"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
        <div className="match-badge">
          <Sparkles size={13} />
          <span>{matchScore}% Match</span>
        </div>
        <div className="budget-badge">{budgetTier}</div>

        <button
          onClick={handleToggleWishlist}
          title={isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
          disabled={saving}
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            right: '0.75rem',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            zIndex: 2
          }}
        >
          <Heart size={16} color={isSaved ? '#f43f5e' : '#ffffff'} fill={isSaved ? '#f43f5e' : 'none'} />
        </button>
      </div>

      <div className="card-body">
        <h3 className="card-title">{name}</h3>
        <p className="card-location">
          <MapPin size={14} color="var(--primary)" />
          {displayLocation}
        </p>

        <p className="card-desc">{tagline}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          {interests.slice(0, 4).map((interest) => (
            <span
              key={interest}
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: '#f1f5f9',
                color: '#475569',
                textTransform: 'capitalize'
              }}
            >
              #{interest}
            </span>
          ))}
        </div>

        <div className="card-meta">
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Daily Estimate</span>
            <span className="cost-highlight">{dailyCost}/day</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Clock size={12} /> {minDurationDays}-{maxDurationDays} Days
            </span>
            <Link
              to={`/destinations/${_id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 600,
                color: 'var(--primary)',
                marginTop: '0.25rem',
                fontSize: '0.85rem'
              }}
            >
              Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default DestinationCard;
