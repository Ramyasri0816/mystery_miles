import SavedTrip from '../models/SavedTrip.model.js';
import Destination from '../models/Destination.model.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

/**
 * Save a destination to user's wishlist / saved trips
 * Enforces duplicate prevention
 */
export const createSavedTrip = async (req, res, next) => {
  try {
    const { destinationId, notes, visitedStatus, targetDate, targetBudget } = req.body;
    const userId = req.user._id;

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return apiError(res, {
        statusCode: 404,
        message: 'Destination not found.'
      });
    }

    // Check for existing saved trip (duplicate check)
    const existing = await SavedTrip.findOne({ user: userId, destination: destinationId });
    if (existing) {
      return apiError(res, {
        statusCode: 409,
        message: 'This destination is already in your saved trips.'
      });
    }

    const savedTrip = await SavedTrip.create({
      user: userId,
      destination: destinationId,
      notes: notes || '',
      visitedStatus: visitedStatus || 'planned',
      targetDate: targetDate || null,
      targetBudget: targetBudget || null
    });

    const populated = await savedTrip.populate('destination');

    return apiSuccess(res, {
      statusCode: 201,
      message: 'Destination saved to your trips successfully',
      data: {
        savedTrip: populated
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all saved trips for the authenticated user
 */
export const getMySavedTrips = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { visitedStatus } = req.query;

    const query = { user: userId };
    if (visitedStatus && ['planned', 'visited'].includes(visitedStatus)) {
      query.visitedStatus = visitedStatus;
    }

    const savedTrips = await SavedTrip.find(query)
      .populate('destination')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess(res, {
      message: 'Saved trips retrieved successfully',
      data: {
        savedTrips,
        count: savedTrips.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update personal notes and visited status of a saved trip
 * Enforces ownership check
 */
export const updateSavedTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, visitedStatus, targetDate, targetBudget } = req.body;
    const userId = req.user._id.toString();

    const savedTrip = await SavedTrip.findById(id);
    if (!savedTrip) {
      return apiError(res, {
        statusCode: 404,
        message: 'Saved trip not found.'
      });
    }

    // Security check: Only the trip owner can update it
    if (savedTrip.user.toString() !== userId) {
      return apiError(res, {
        statusCode: 403,
        message: 'Access denied: You cannot modify another user’s saved trip.'
      });
    }

    if (notes !== undefined) savedTrip.notes = notes;
    if (visitedStatus !== undefined) savedTrip.visitedStatus = visitedStatus;
    if (targetDate !== undefined) savedTrip.targetDate = targetDate;
    if (targetBudget !== undefined) savedTrip.targetBudget = targetBudget;

    await savedTrip.save();
    const populated = await savedTrip.populate('destination');

    return apiSuccess(res, {
      message: 'Saved trip updated successfully',
      data: {
        savedTrip: populated
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a saved trip
 * Enforces ownership check
 */
export const deleteSavedTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const savedTrip = await SavedTrip.findById(id);
    if (!savedTrip) {
      return apiError(res, {
        statusCode: 404,
        message: 'Saved trip not found.'
      });
    }

    // Security check: Only the trip owner can delete it
    if (savedTrip.user.toString() !== userId) {
      return apiError(res, {
        statusCode: 403,
        message: 'Access denied: You cannot delete another user’s saved trip.'
      });
    }

    await SavedTrip.findByIdAndDelete(id);

    return apiSuccess(res, {
      message: 'Trip removed from your saved list successfully'
    });
  } catch (error) {
    next(error);
  }
};
