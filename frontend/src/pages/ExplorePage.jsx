import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DestinationCard from '../components/discovery/DestinationCard';
import api from '../services/api';
import { Search, Filter, Compass, RefreshCw, SlidersHorizontal, ArrowLeft, ArrowRight, X } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Hill Station',
  'Beach',
  'Heritage',
  'Spiritual',
  'Wildlife',
  'Adventure',
  'Nature',
  'Desert',
  'Island'
];

const STATES = [
  'All States',
  'Rajasthan',
  'Kerala',
  'Karnataka',
  'Himachal Pradesh',
  'Uttarakhand',
  'Ladakh',
  'Goa',
  'Meghalaya',
  'Uttar Pradesh',
  'Tamil Nadu',
  'Assam',
  'Gujarat',
  'Puducherry',
  'Andaman & Nicobar'
];

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state initialized from query params if present
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [state, setState] = useState(searchParams.get('state') || 'All States');
  const [budgetTier, setBudgetTier] = useState(searchParams.get('budgetTier') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 9 });

  const fetchDestinations = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category && category !== 'All') params.append('category', category);
      if (state && state !== 'All States') params.append('state', state);
      if (budgetTier && budgetTier !== 'all') params.append('budgetTier', budgetTier);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', page);
      params.append('limit', 9);

      const res = await api.get(`/destinations?${params.toString()}`);
      setDestinations(res.data?.destinations || []);
      setPagination(res.data?.pagination || { total: 0, totalPages: 1, limit: 9 });
    } catch (err) {
      setError(err.message || 'Failed to load destinations.');
    } finally {
      setLoading(false);
    }
  };

  // Sync state with URL params when category is clicked from Home
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && urlCategory !== category) {
      setCategory(urlCategory);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDestinations();
  }, [category, state, budgetTier, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDestinations();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setState('All States');
    setBudgetTier('all');
    setSortBy('rating');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Title & Description */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Explore India’s Hidden Wonders
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.4rem auto 0' }}>
          Browse 27+ handpicked escapes across 15 states with authentic daily budget estimates, verified highlights, and traveler reviews.
        </p>
      </div>

      {/* Search & Quick Filters Bar */}
      <div
        style={{
          background: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--surface-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by destination name, highlight, or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>

        {/* Dropdown Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
          {/* State */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              State / Region
            </label>
            <select
              className="form-select"
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setPage(1);
              }}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Budget Tier */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Budget Tier
            </label>
            <select
              className="form-select"
              value={budgetTier}
              onChange={(e) => {
                setBudgetTier(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Tiers</option>
              <option value="budget">Budget (Under ₹2,000/day)</option>
              <option value="mid-range">Mid-Range (₹2,000 - ₹4,500/day)</option>
              <option value="luxury">Luxury (₹4,500+/day)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Sort Results
            </label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="rating">Top Rated ⭐</option>
              <option value="price_asc">Price: Low to High ₹</option>
              <option value="price_desc">Price: High to Low ₹</option>
              <option value="duration">Shortest Duration</option>
              <option value="name">Destination Name A-Z</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>

          {/* Reset Filters button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-outline"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <RefreshCw size={14} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            className={`chip-btn ${category === cat ? 'active' : ''}`}
            style={{ padding: '0.45rem 1.25rem', fontSize: '0.875rem' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Showing <strong>{destinations.length}</strong> of <strong>{pagination.total}</strong> destinations
          {category !== 'All' ? ` in ${category}` : ''}
          {state !== 'All States' ? ` • ${state}` : ''}
        </p>
      </div>

      {/* Grid or Empty/Loading States */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '6rem 0' }}>
          <Compass size={44} className="spin" color="var(--coral)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading matching Indian destinations...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#fef2f2', borderRadius: 'var(--radius-lg)', color: '#b91c1c' }}>
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button onClick={fetchDestinations} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      ) : destinations.length > 0 ? (
        <>
          <div className="destinations-grid">
            {destinations.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination-wrap">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="page-btn"
                aria-label="Previous Page"
              >
                <ArrowLeft size={16} />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`page-btn ${page === p ? 'active' : ''}`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page >= pagination.totalPages}
                className="page-btn"
                aria-label="Next Page"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '6rem 1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--surface-border)' }}>
          <Compass size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Destinations Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            No Indian destinations matched your exact combination of search terms and filters.
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary">
            Reset Filters & View All
          </button>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
