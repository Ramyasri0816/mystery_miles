import api from './api';

export const travelService = {
  /**
   * Discover destinations based on user preferences
   * @param {Object} preferences
   * @param {number} [preferences.budget]
   * @param {string} [preferences.budgetTier]
   * @param {number} [preferences.availableTimeDays]
   * @param {string[]} [preferences.interests]
   * @param {string} [preferences.startingLocation]
   * @param {string} [preferences.travelStyle]
   */
  async discoverDestinations(preferences = {}) {
    const params = new URLSearchParams();

    if (preferences.budget) params.append('budget', preferences.budget);
    if (preferences.budgetTier && preferences.budgetTier !== 'any') {
      params.append('budgetTier', preferences.budgetTier);
    }
    if (preferences.availableTimeDays) {
      params.append('availableTimeDays', preferences.availableTimeDays);
    }
    if (preferences.startingLocation) {
      params.append('startingLocation', preferences.startingLocation);
    }
    if (preferences.travelStyle) {
      params.append('travelStyle', preferences.travelStyle);
    }
    if (preferences.interests && preferences.interests.length > 0) {
      params.append('interests', preferences.interests.join(','));
    }

    return api.get(`/destinations/discover?${params.toString()}`);
  },

  async getAllDestinations() {
    return api.get('/destinations');
  },

  async getDestinationById(id) {
    return api.get(`/destinations/${id}`);
  },

  async checkHealth() {
    return api.get('/health');
  }
};

export default travelService;
