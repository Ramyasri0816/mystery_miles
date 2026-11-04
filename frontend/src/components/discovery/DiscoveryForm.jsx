import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Clock, Compass, Sparkles, Dices } from 'lucide-react';

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

const STYLE_OPTIONS = [
  { value: 'solo', label: 'Solo Adventurer' },
  { value: 'couple', label: 'Romantic Couple' },
  { value: 'family', label: 'Family Friendly' },
  { value: 'backpacker', label: 'Backpacker' },
  { value: 'luxury', label: 'Luxury Comfort' },
  { value: 'adventure', label: 'Action & Adventure' },
  { value: 'cultural', label: 'Culture & Heritage' }
];

export const DiscoveryForm = ({ onDiscover, onSpin, initialValues = {}, isLoading = false }) => {
  const [startingLocation, setStartingLocation] = useState(initialValues.startingLocation || 'New Delhi / NCR');
  const [budget, setBudget] = useState(initialValues.budget || 15000);
  const [durationValue, setDurationValue] = useState(initialValues.durationValue || 4);
  const [durationUnit, setDurationUnit] = useState(initialValues.durationUnit || 'days');
  const [travelStyle, setTravelStyle] = useState(initialValues.travelStyle || 'solo');
  const [selectedInterests, setSelectedInterests] = useState(
    initialValues.interests || ['nature', 'mountain', 'adventure']
  );

  const toggleInterest = (interest) => {
    const lower = interest.toLowerCase();
    if (selectedInterests.includes(lower)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== lower));
    } else {
      setSelectedInterests([...selectedInterests, lower]);
    }
  };

  const getFormData = () => ({
    startingLocation: startingLocation.trim(),
    budget: Number(budget),
    durationValue: Number(durationValue),
    durationUnit,
    travelStyle,
    interests: selectedInterests
  });

  const handleBrowseSubmit = (e) => {
    e.preventDefault();
    if (onDiscover) {
      onDiscover(getFormData());
    }
  };

  const handleSpinClick = (e) => {
    e.preventDefault();
    if (onSpin) {
      onSpin(getFormData());
    }
  };

  return (
    <form className="discovery-card" onSubmit={handleBrowseSubmit}>
      <div className="form-grid">
        {/* Starting Location with Indian Hubs */}
        <div className="form-group">
          <label className="form-label">
            <MapPin size={16} color="var(--primary)" />
            Starting Location in India
          </label>
          <input
            list="indian-hubs"
            type="text"
            className="form-input"
            placeholder="Type or pick e.g. Mumbai, Delhi, Bengaluru..."
            value={startingLocation}
            onChange={(e) => setStartingLocation(e.target.value)}
          />
          <datalist id="indian-hubs">
            {POPULAR_INDIAN_HUBS.map((hub) => (
              <option key={hub} value={hub} />
            ))}
          </datalist>
        </div>

        {/* Available Duration (Days or Hours) */}
        <div className="form-group">
          <label className="form-label">
            <Clock size={16} color="var(--primary)" />
            Available Duration
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              className="form-input"
              value={durationValue}
              onChange={(e) => setDurationValue(Math.max(1, Number(e.target.value)))}
              min="1"
              max={durationUnit === 'hours' ? 720 : 60}
              style={{ flex: 1 }}
            />
            <select
              className="form-select"
              value={durationUnit}
              onChange={(e) => {
                const newUnit = e.target.value;
                setDurationUnit(newUnit);
                if (newUnit === 'hours' && durationValue <= 10) {
                  setDurationValue(durationValue * 24);
                } else if (newUnit === 'days' && durationValue > 15) {
                  setDurationValue(Math.max(1, Math.round(durationValue / 24)));
                }
              }}
              style={{ width: '100px' }}
            >
              <option value="days">Days</option>
              <option value="hours">Hours</option>
            </select>
          </div>
        </div>

        {/* Total Budget in INR */}
        <div className="form-group">
          <label className="form-label">
            <DollarSign size={16} color="var(--primary)" />
            Total Budget (₹ INR)
          </label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 15000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min="500"
            step="500"
          />
        </div>

        {/* Travel Style */}
        <div className="form-group">
          <label className="form-label">
            <Compass size={16} color="var(--primary)" />
            Travel Style
          </label>
          <select
            className="form-select"
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value)}
          >
            {STYLE_OPTIONS.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preferred Interests Multi-Select Pills */}
      <div style={{ marginTop: '0.5rem', marginBottom: '1.75rem', textAlign: 'left' }}>
        <label className="form-label" style={{ marginBottom: '0.65rem' }}>
          <Sparkles size={16} color="var(--accent)" />
          Preferred Interests (Scored at 40%)
        </label>
        <div className="chips-group">
          {INTEREST_OPTIONS.map((interest) => {
            const active = selectedInterests.includes(interest.toLowerCase());
            return (
              <button
                type="button"
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`chip-btn ${active ? 'active' : ''}`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons: Signature Mystery Spin & Ranked Browse */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="submit"
          className="btn btn-outline"
          disabled={isLoading}
          style={{ minWidth: '180px' }}
        >
          <Search size={16} />
          <span>Browse Matching List</span>
        </button>

        <button
          type="button"
          onClick={handleSpinClick}
          className="btn btn-primary"
          disabled={isLoading}
          style={{
            minWidth: '240px',
            background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
          }}
        >
          <Dices size={18} />
          <span>{isLoading ? 'Spinning Mystery...' : '🎲 Spin Mystery Destination'}</span>
        </button>
      </div>
    </form>
  );
};

export default DiscoveryForm;
