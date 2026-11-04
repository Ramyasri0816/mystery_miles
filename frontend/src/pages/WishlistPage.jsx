import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import savedTripService from '../services/savedTripService';
import { Heart, MapPin, Trash2, Edit3, Check, Calendar, DollarSign, Compass, ArrowRight, AlertCircle } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

export const WishlistPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [savedTrips, setSavedTrips] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'planned' | 'visited'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('planned');

  const fetchSavedTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await savedTripService.getMySavedTrips(filter === 'all' ? undefined : filter);
      setSavedTrips(res.data?.savedTrips || []);
    } catch (err) {
      setError(err.message || 'Failed to load your wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedTrips();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this destination from your wishlist?')) return;
    try {
      await savedTripService.deleteSavedTrip(id);
      setSavedTrips(savedTrips.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to remove saved trip.');
    }
  };

  const startEditing = (trip) => {
    setEditingId(trip._id);
    setEditNotes(trip.notes || '');
    setEditStatus(trip.visitedStatus || 'planned');
  };

  const handleUpdate = async (id) => {
    try {
      const res = await savedTripService.updateSavedTrip(id, {
        notes: editNotes,
        visitedStatus: editStatus
      });
      setSavedTrips(savedTrips.map((t) => (t._id === id ? res.data?.savedTrip || { ...t, notes: editNotes, visitedStatus: editStatus } : t)));
      setEditingId(null);
    } catch (err) {
      alert(err.message || 'Failed to update saved trip.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <Heart size={56} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Your Travel Wishlist
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Sign in to save dreamy destinations, track places you've visited, and add private trip notes.
        </p>
        <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
          Sign In to Access Wishlist
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Heart size={28} color="#e11d48" fill="#e11d48" />
            <span>My Travel Wishlist</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage saved places, private itineraries, and travel notes.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: 'var(--radius-full)', padding: '0.25rem' }}>
          {['all', 'planned', 'visited'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '0.4rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.85rem',
                textTransform: 'capitalize',
                background: filter === tab ? 'var(--surface)' : 'transparent',
                color: filter === tab ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: filter === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-sm)', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Compass size={40} className="spin" color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading your saved journeys...</p>
        </div>
      ) : savedTrips.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {savedTrips.map((item) => {
            const dest = item.destination || {};
            const img = dest.imageUrl || (dest.imageUrls && dest.imageUrls.length > 0 ? dest.imageUrls[0] : FALLBACK_IMAGE);
            const isEditing = editingId === item._id;

            return (
              <div
                key={item._id}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--surface-border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', height: '180px' }}>
                  <img src={img} alt={dest.name || 'Destination'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      background: item.visitedStatus === 'visited' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(2, 132, 199, 0.9)',
                      color: '#ffffff',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {item.visitedStatus}
                  </span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    title="Remove from wishlist"
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <Link to={`/destinations/${dest._id}`} style={{ color: 'inherit' }}>
                      {dest.name}
                    </Link>
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    <MapPin size={14} color="var(--primary)" />
                    {dest.state ? `${dest.state}, India` : dest.country}
                  </p>

                  {/* Notes / Edit Section */}
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', flex: 1 }}>
                    {isEditing ? (
                      <div>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add private trip notes, gear reminders..."
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          >
                            <option value="planned">Status: Planned</option>
                            <option value="visited">Status: Visited</option>
                          </select>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button onClick={() => handleUpdate(item._id)} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                              Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ color: '#475569', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Private Notes</strong>
                          <span style={{ color: item.notes ? 'var(--text-main)' : 'var(--text-muted)', fontStyle: item.notes ? 'normal' : 'italic' }}>
                            {item.notes || 'No notes added yet.'}
                          </span>
                        </div>
                        <button onClick={() => startEditing(item)} title="Edit Notes" style={{ color: 'var(--primary)', padding: '0.2rem' }}>
                          <Edit3 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--surface-border)' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {dest.estimatedDailyCostINR ? `₹${dest.estimatedDailyCostINR.toLocaleString()}/day` : `$${dest.estimatedDailyCostUSD}/day`}
                    </span>
                    <Link to={`/destinations/${dest._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                      View Guide <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
          <Compass size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {filter === 'all' ? 'Your wishlist is empty' : `No ${filter} trips found`}
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Explore Indian destinations matched to your budget and travel style, and click the heart icon to save them!
          </p>
          <Link to="/discover" className="btn btn-primary">
            Explore Recommended Destinations
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
