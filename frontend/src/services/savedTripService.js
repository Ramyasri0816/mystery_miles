import api from './api';

export const savedTripService = {
  // Get all saved trips for current user (optional filter: 'planned' | 'visited')
  async getMySavedTrips(visitedStatus) {
    const params = visitedStatus ? `?visitedStatus=${visitedStatus}` : '';
    return api.get(`/saved-trips${params}`);
  },

  // Add a destination to wishlist
  async saveTrip({ destinationId, notes = '', visitedStatus = 'planned', targetDate = null, targetBudget = null }) {
    return api.post('/saved-trips', {
      destinationId,
      notes,
      visitedStatus,
      targetDate,
      targetBudget
    });
  },

  // Update notes, visited status, or budget
  async updateSavedTrip(id, { notes, visitedStatus, targetDate, targetBudget }) {
    return api.put(`/saved-trips/${id}`, {
      notes,
      visitedStatus,
      targetDate,
      targetBudget
    });
  },

  // Remove trip from wishlist
  async deleteSavedTrip(id) {
    return api.delete(`/saved-trips/${id}`);
  }
};

export default savedTripService;
