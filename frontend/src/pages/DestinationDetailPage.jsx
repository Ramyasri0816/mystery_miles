import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { travelService } from '../services/travelService';
import { reviewService } from '../services/reviewService';
import { savedTripService } from '../services/savedTripService';
import useAuth from '../hooks/useAuth';
import { MapPin, Sparkles, Clock, ArrowLeft, Check, Heart, Star, Send, Trash2, User, AlertCircle } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

export const DestinationDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wishlist state
  const [isSaved, setIsSaved] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const loadDestinationAndReviews = async () => {
    try {
      const [destRes, reviewsRes] = await Promise.all([
        travelService.getDestinationById(id),
        reviewService.getDestinationReviews(id)
      ]);

      const dest = destRes.data?.destination;
      setDestination(dest);
      const initialImg = dest?.imageUrl || (dest?.imageUrls && dest.imageUrls.length > 0 ? dest.imageUrls[0] : FALLBACK_IMAGE);
      setSelectedImage(initialImg);
      setReviews(reviewsRes.data?.reviews || []);
    } catch (err) {
      setError(err.message || 'Failed to load destination details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinationAndReviews();
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSavingWishlist(true);
    try {
      if (!isSaved) {
        await savedTripService.saveTrip({ destinationId: id });
        setIsSaved(true);
      }
    } catch (err) {
      if (err.message && err.message.includes('already')) {
        setIsSaved(true);
      } else {
        alert(err.message || 'Could not save to wishlist');
      }
    } finally {
      setSavingWishlist(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await reviewService.createReview(id, {
        rating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim()
      });

      setReviewSuccess('Thank you! Your review has been published.');
      setReviewComment('');
      setReviewTitle('');
      setRating(5);

      // Refresh reviews and updated destination average rating
      const reviewsRes = await reviewService.getDestinationReviews(id);
      setReviews(reviewsRes.data?.reviews || []);
      if (res.data?.destinationStats) {
        setDestination((prev) => ({
          ...prev,
          averageRating: res.data.destinationStats.averageRating,
          reviewCount: res.data.destinationStats.reviewCount
        }));
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewService.deleteReview(reviewId);
      setReviews(reviews.filter((r) => r._id !== reviewId));
      // Reload destination stats
      const destRes = await travelService.getDestinationById(id);
      setDestination(destRes.data?.destination);
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading destination details...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Destination Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error || 'Unable to find this destination.'}</p>
        <Link to="/discover" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Discover
        </Link>
      </div>
    );
  }

  const displayLocation = [destination.city, destination.state, destination.country].filter(Boolean).join(', ');
  const dailyCost = destination.estimatedDailyCostINR
    ? `₹${destination.estimatedDailyCostINR.toLocaleString()}`
    : `$${destination.estimatedDailyCostUSD || 50}`;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/discover" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Discover
        </Link>

        {/* Wishlist CTA Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={savingWishlist}
          className={`btn ${isSaved ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '0.5rem 1.25rem' }}
        >
          <Heart size={16} color={isSaved ? '#ffffff' : '#e11d48'} fill={isSaved ? '#ffffff' : 'none'} />
          <span>{isSaved ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
        </button>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
        {/* Hero Image Banner */}
        <div style={{ position: 'relative', height: '440px', background: '#0f172a' }}>
          <img
            src={selectedImage || FALLBACK_IMAGE}
            alt={destination.name}
            onError={() => setSelectedImage(FALLBACK_IMAGE)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '2.5rem',
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)',
              color: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--primary)', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                {destination.budgetTier}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                {destination.category}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                <MapPin size={14} /> {displayLocation}
              </span>
              {destination.averageRating > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }}>
                  <Star size={14} fill="#f59e0b" /> {destination.averageRating.toFixed(1)} ({destination.reviewCount} reviews)
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{destination.name}</h1>
            <p style={{ opacity: 0.9, fontSize: '1.1rem', marginTop: '0.25rem', maxWidth: '800px' }}>{destination.tagline}</p>
          </div>
        </div>

        {/* Gallery Thumbnails */}
        {destination.imageUrls && destination.imageUrls.length > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 2.5rem', background: '#f8fafc', borderBottom: '1px solid var(--surface-border)' }}>
            {destination.imageUrls.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${destination.name} view ${idx + 1}`}
                onClick={() => setSelectedImage(img)}
                style={{
                  width: '80px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: selectedImage === img ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                  opacity: selectedImage === img ? 1 : 0.7,
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>
        )}

        <div style={{ padding: '2.5rem' }}>
          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Daily Estimate</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>{dailyCost} / day</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Recommended Stay</span>
              <strong style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>{destination.minDurationDays} - {destination.maxDurationDays} Days</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Best Seasons</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{destination.bestSeasons?.join(', ') || 'All Year'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Travel Styles</span>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {destination.travelStyles?.map((style) => (
                  <span key={style} style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>About this Destination</h2>
          <p style={{ color: '#334155', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1.05rem' }}>{destination.description}</p>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>Highlights & Experiences</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
            {destination.highlights?.map((highlight, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#dcfce7', color: 'var(--success)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={14} />
                </div>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)', margin: '3rem 0' }} />

          {/* COMMUNITY REVIEWS SECTION */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Traveler Reviews</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', color: '#f59e0b' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} fill={star <= Math.round(destination.averageRating || 0) ? '#f59e0b' : 'none'} color="#f59e0b" />
                    ))}
                  </div>
                  <strong style={{ fontSize: '1.1rem' }}>{destination.averageRating ? destination.averageRating.toFixed(1) : 'No ratings yet'}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                </div>
              </div>
            </div>

            {/* WRITE A REVIEW FORM */}
            <div style={{ background: '#f8fafc', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Share Your Experience
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Have you traveled to {destination.name}? Help fellow explorers discover what to expect!
              </p>

              {reviewError && (
                <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-sm)', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} />
                  <span>{reviewError}</span>
                </div>
              )}

              {reviewSuccess && (
                <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 'var(--radius-sm)', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <Check size={16} />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                {/* Star Rating Selector */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Your Rating
                  </label>
                  <div style={{ display: 'flex', gap: '0.35rem', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Star size={24} color="#f59e0b" fill={star <= rating ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Short Title (e.g. Magnificent views and peaceful atmosphere)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Write your honest review (min 5 characters)..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    minLength={5}
                    maxLength={2000}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  <Send size={15} />
                  <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </form>
            </div>

            {/* REVIEWS LIST */}
            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map((rev) => {
                  const author = rev.user || {};
                  const isOwner = user && (user.id === author._id || user._id === author._id);

                  return (
                    <div
                      key={rev._id}
                      style={{
                        padding: '1.5rem',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--surface-border)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {author.name ? author.name.charAt(0).toUpperCase() : <User size={18} />}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.95rem' }}>{author.name || 'Anonymous Traveler'}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', color: '#f59e0b' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} size={14} fill={star <= rev.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                            ))}
                          </div>

                          {isOwner && (
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              title="Delete your review"
                              style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {rev.title && <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0 0.25rem' }}>{rev.title}</h4>}
                      <p style={{ color: '#334155', fontSize: '0.925rem', lineHeight: 1.6 }}>{rev.comment}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No community reviews yet. Be the first to share your journey!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetailPage;
