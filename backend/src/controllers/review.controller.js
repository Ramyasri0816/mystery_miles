import Review from '../models/Review.model.js';
import Destination from '../models/Destination.model.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

/**
 * Create a review for a destination
 * Enforces one review per user per destination
 */
export const createReview = async (req, res, next) => {
  try {
    const { destinationId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user._id;

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return apiError(res, {
        statusCode: 404,
        message: 'Destination not found.'
      });
    }

    // Check if user already reviewed this destination
    const existing = await Review.findOne({ user: userId, destination: destinationId });
    if (existing) {
      return apiError(res, {
        statusCode: 409,
        message: 'You have already reviewed this destination. You can update your existing review.'
      });
    }

    const review = await Review.create({
      user: userId,
      destination: destinationId,
      rating,
      title: title || '',
      comment
    });

    const populated = await review.populate('user', 'name avatar');

    // Fetch updated destination rating
    const updatedDest = await Destination.findById(destinationId).select('averageRating reviewCount');

    return apiSuccess(res, {
      statusCode: 201,
      message: 'Review posted successfully',
      data: {
        review: populated,
        destinationStats: {
          averageRating: updatedDest.averageRating,
          reviewCount: updatedDest.reviewCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews for a destination with pagination
 */
export const getDestinationReviews = async (req, res, next) => {
  try {
    const { destinationId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ destination: destinationId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ destination: destinationId })
    ]);

    const totalPages = Math.ceil(total / limit);

    return apiSuccess(res, {
      message: 'Reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review
 * Enforces ownership check (only review owner or admin)
 */
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user._id.toString();

    const review = await Review.findById(id);
    if (!review) {
      return apiError(res, {
        statusCode: 404,
        message: 'Review not found.'
      });
    }

    // Security check: Only the review creator or an admin can update
    if (review.user.toString() !== userId && req.user.role !== 'admin') {
      return apiError(res, {
        statusCode: 403,
        message: 'Access denied: You cannot edit another traveler’s review.'
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;

    await review.save(); // triggers post('save') recalculation of destination rating

    const populated = await review.populate('user', 'name avatar');
    const updatedDest = await Destination.findById(review.destination).select('averageRating reviewCount');

    return apiSuccess(res, {
      message: 'Review updated successfully',
      data: {
        review: populated,
        destinationStats: {
          averageRating: updatedDest?.averageRating,
          reviewCount: updatedDest?.reviewCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 * Enforces ownership check
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const review = await Review.findById(id);
    if (!review) {
      return apiError(res, {
        statusCode: 404,
        message: 'Review not found.'
      });
    }

    // Security check: Only the review creator or an admin can delete
    if (review.user.toString() !== userId && req.user.role !== 'admin') {
      return apiError(res, {
        statusCode: 403,
        message: 'Access denied: You cannot delete another traveler’s review.'
      });
    }

    const destinationId = review.destination;
    await Review.findByIdAndDelete(id);

    // Recalculate average rating
    await Review.calculateAverageRating(destinationId);

    const updatedDest = await Destination.findById(destinationId).select('averageRating reviewCount');

    return apiSuccess(res, {
      message: 'Review deleted successfully',
      data: {
        destinationStats: {
          averageRating: updatedDest?.averageRating || 0,
          reviewCount: updatedDest?.reviewCount || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
