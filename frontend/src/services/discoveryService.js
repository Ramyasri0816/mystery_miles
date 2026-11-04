import api from './api';

export const discoveryService = {
  // Spin the signature Mystery Destination Matching Engine
  async spinMystery({ budget, durationValue, durationUnit = 'days', startingLocation = '', interests = [], travelStyle = '' }) {
    return api.post('/discovery/spin', {
      budget,
      durationValue,
      durationUnit,
      startingLocation,
      interests,
      travelStyle
    });
  },

  // Get user's discovery spin history
  async getDiscoveryHistory() {
    return api.get('/discovery/history');
  },

  // Get supported Indian starting locations
  async getStartingLocations() {
    return api.get('/discovery/starting-locations');
  }
};

export default discoveryService;
