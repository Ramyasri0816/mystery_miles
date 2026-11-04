/**
 * Curated directory of major Indian starting locations and transit zones
 */

export const INDIAN_STARTING_LOCATIONS = [
  { city: 'New Delhi / NCR', state: 'Delhi', zone: 'North', airportCode: 'DEL', isMajorHub: true },
  { city: 'Mumbai', state: 'Maharashtra', zone: 'West', airportCode: 'BOM', isMajorHub: true },
  { city: 'Bengaluru', state: 'Karnataka', zone: 'South', airportCode: 'BLR', isMajorHub: true },
  { city: 'Kolkata', state: 'West Bengal', zone: 'East', airportCode: 'CCU', isMajorHub: true },
  { city: 'Chennai', state: 'Tamil Nadu', zone: 'South', airportCode: 'MAA', isMajorHub: true },
  { city: 'Hyderabad', state: 'Telangana', zone: 'South', airportCode: 'HYD', isMajorHub: true },
  { city: 'Pune', state: 'Maharashtra', zone: 'West', airportCode: 'PNQ', isMajorHub: true },
  { city: 'Ahmedabad', state: 'Gujarat', zone: 'West', airportCode: 'AMD', isMajorHub: true },
  { city: 'Jaipur', state: 'Rajasthan', zone: 'North', airportCode: 'JAI', isMajorHub: true },
  { city: 'Kochi', state: 'Kerala', zone: 'South', airportCode: 'COK', isMajorHub: true },
  { city: 'Chandigarh', state: 'Punjab / Haryana', zone: 'North', airportCode: 'IXC', isMajorHub: true },
  { city: 'Lucknow', state: 'Uttar Pradesh', zone: 'North', airportCode: 'LKO', isMajorHub: true },
  { city: 'Guwahati', state: 'Assam', zone: 'Northeast', airportCode: 'GAU', isMajorHub: true },
  { city: 'Goa (Panaji / Vasco)', state: 'Goa', zone: 'West', airportCode: 'GOI', isMajorHub: true },
  { city: 'Bhopal', state: 'Madhya Pradesh', zone: 'Central', airportCode: 'BHO', isMajorHub: false },
  { city: 'Indore', state: 'Madhya Pradesh', zone: 'Central', airportCode: 'IDR', isMajorHub: false },
  { city: 'Dehradun', state: 'Uttarakhand', zone: 'North', airportCode: 'DED', isMajorHub: false },
  { city: 'Amritsar', state: 'Punjab', zone: 'North', airportCode: 'ATQ', isMajorHub: false },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', zone: 'South', airportCode: 'VTZ', isMajorHub: false },
  { city: 'Bhubaneswar', state: 'Odisha', zone: 'East', airportCode: 'BBI', isMajorHub: false },
  { city: 'Coimbatore', state: 'Tamil Nadu', zone: 'South', airportCode: 'CJB', isMajorHub: false },
  { city: 'Patna', state: 'Bihar', zone: 'East', airportCode: 'PAT', isMajorHub: false },
  { city: 'Surat', state: 'Gujarat', zone: 'West', airportCode: 'STV', isMajorHub: false },
  { city: 'Srinagar', state: 'Jammu & Kashmir', zone: 'North', airportCode: 'SXR', isMajorHub: false }
];

export const STATE_TO_ZONE = {
  Ladakh: 'North',
  'Jammu & Kashmir': 'North',
  'Himachal Pradesh': 'North',
  Punjab: 'North',
  Uttarakhand: 'North',
  'Uttar Pradesh': 'North',
  Delhi: 'North',
  Rajasthan: 'North',
  Maharashtra: 'West',
  Gujarat: 'West',
  Goa: 'West',
  Karnataka: 'South',
  Kerala: 'South',
  'Tamil Nadu': 'South',
  'Andhra Pradesh': 'South',
  Telangana: 'South',
  Puducherry: 'South',
  'Andaman & Nicobar': 'Islands',
  'West Bengal': 'East',
  Odisha: 'East',
  Bihar: 'East',
  Assam: 'Northeast',
  Meghalaya: 'Northeast',
  'Arunachal Pradesh': 'Northeast',
  'Madhya Pradesh': 'Central'
};

/**
 * Estimate transit buffer days required between starting location and destination
 * @param {string} startLocationName
 * @param {string} destState
 * @returns {{ compatible: boolean, transitDays: number, reason: string }}
 */
export const checkLocationCompatibility = (startLocationName, destState, availableDays) => {
  if (!startLocationName || !startLocationName.trim()) {
    return { compatible: true, transitDays: 0, reason: 'Flexible starting location' };
  }

  const cleanStart = startLocationName.toLowerCase().trim();
  const matchedLocation = INDIAN_STARTING_LOCATIONS.find((loc) =>
    cleanStart.includes(loc.city.toLowerCase()) ||
    loc.city.toLowerCase().includes(cleanStart) ||
    cleanStart.includes(loc.state.toLowerCase())
  );

  const startZone = matchedLocation ? matchedLocation.zone : 'Other';
  const destZone = STATE_TO_ZONE[destState] || 'Other';

  // Local / same state or zone travel
  if (startZone === destZone) {
    const transitDays = 0.5;
    return {
      compatible: true,
      transitDays,
      reason: `Intra-zone connection within ${startZone} India (~0.5 day transit)`
    };
  }

  // Cross-country remote regions (e.g. Andaman Islands, High Ladakh, Northeast) on very short durations
  const isHighRemote = destState === 'Andaman & Nicobar' || destState === 'Ladakh' || destState === 'Arunachal Pradesh';
  const transitDays = isHighRemote ? 1.5 : 1.0;

  // If available days minus round-trip transit leaves less than 1.5 days for the destination
  const effectiveStayDays = availableDays - (transitDays * 1.5);
  if (effectiveStayDays < 1.5 && availableDays < 3) {
    return {
      compatible: false,
      transitDays,
      reason: `Transit from ${startLocationName} to ${destState} (${destZone} zone) requires ~${transitDays * 2} days round-trip, leaving insufficient stay time for a ${availableDays}-day trip.`
    };
  }

  return {
    compatible: true,
    transitDays,
    reason: `Inter-zone flight/train connectivity from ${startLocationName} to ${destState} (~${transitDays} day transit)`
  };
};

export default {
  INDIAN_STARTING_LOCATIONS,
  STATE_TO_ZONE,
  checkLocationCompatibility
};
