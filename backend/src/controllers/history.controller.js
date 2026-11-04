import DiscoveryHistory from '../models/DiscoveryHistory.model.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const getMyDiscoveryHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const history = await DiscoveryHistory.find({ user: userId })
      .populate('topMatches.destination', 'name state imageUrls budgetTier estimatedDailyCostINR')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return apiSuccess(res, {
      message: 'Discovery history retrieved successfully',
      data: {
        history,
        count: history.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const clearDiscoveryHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await DiscoveryHistory.deleteMany({ user: userId });

    return apiSuccess(res, {
      message: 'Discovery history cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
