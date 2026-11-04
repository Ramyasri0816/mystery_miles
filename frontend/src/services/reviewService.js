import api from './api';

export const reviewService = {
  // Get all reviews for a destination
  async getDestinationReviews(destinationId, page = 1, limit = 10) {
    return api.get(`/destinations/${destinationId}/reviews?page=${page}&limit=${limit}`);
  },

  // Post a new review
  async createReview(destinationId, { rating, title = '', comment }) {
    return api.post(`/destinations/${destinationId}/reviews`, {
      rating,
      title,
      comment
    });
  },

  // Edit existing review
  async updateReview(reviewId, { rating, title, comment }) {
    return api.put(`/reviews/${reviewId}`, {
      rating,
      title,
      comment
    });
  },

  // Delete review
  async deleteReview(reviewId) {
    return api.delete(`/reviews/${reviewId}`);
  }
};

export default reviewService;
