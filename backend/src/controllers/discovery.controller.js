import Destination from '../models/Destination.model.js';
import DiscoveryHistory from '../models/DiscoveryHistory.model.js';
import {
  normalizeDurationToDays,
  filterDestinations,
  scoreDestination,
  selectMysteryDestination
} from '../services/matchingEngine.service.js';
import { INDIAN_STARTING_LOCATIONS } from '../utils/indianLocations.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { formatDestination } from './destination.controller.js';

/**
 * POST /api/discovery/spin
 * Signature Feature: Evaluates MongoDB destination records through the Mystery Destination Matching Engine
 */
export const spinMysteryDestination = async (req, res, next) => {
  try {
    const { budget, durationValue, durationUnit = 'days', startingLocation = '', interests = [], travelStyle = '' } = req.body;
    const userId = req.user ? req.user._id : null;

    // 1. Normalize available duration to days
    const availableDays = normalizeDurationToDays(durationValue, durationUnit);
    const budgetINR = Number(budget);

    // 2. Fetch actual stored destination records from MongoDB
    const allDestinations = await Destination.find().lean();

    if (!allDestinations || allDestinations.length === 0) {
      return apiError(res, {
        statusCode: 503,
        message: 'No destinations found in the database. Please run the database seed script.'
      });
    }

    // 3. Strict Boundary Filtering (Budget, Duration, Transit)
    const { eligible, disqualified } = filterDestinations(allDestinations, {
      budgetINR,
      availableDays,
      startingLocation
    });

    // 4. Rule 6: If no destination qualifies, return a helpful, actionable diagnostic message
    if (eligible.length === 0) {
      const minDailyCost = Math.min(...allDestinations.map((d) => d.estimatedDailyCostINR || 2500));
      const minPossibleCost = Math.round(minDailyCost * availableDays);
      const minDurationPossible = Math.min(...allDestinations.map((d) => d.minDurationDays || 2));

      let helpfulHint = 'No destination qualified under your strict criteria.';
      if (budgetINR < minPossibleCost) {
        helpfulHint = `Your budget of ₹${budgetINR.toLocaleString()} is below the minimum required for a ${availableDays}-day trip. The most affordable destination requires at least ₹${minPossibleCost.toLocaleString()} (₹${minDailyCost.toLocaleString()}/day). Try increasing your budget or reducing duration.`;
      } else if (availableDays < minDurationPossible) {
        helpfulHint = `Your available duration of ${availableDays} days is below the minimum required stay for any destination. Minimum stay required is ${minDurationPossible} days. Try increasing your duration.`;
      } else if (startingLocation) {
        helpfulHint = `No destinations were reachable from "${startingLocation}" within your ${availableDays}-day duration buffer. Try choosing a closer hub or increasing your duration.`;
      }

      return apiSuccess(res, {
        statusCode: 200,
        message: 'No destinations matched your criteria',
        data: {
          qualified: false,
          userCriteria: {
            budgetINR,
            availableDays,
            durationValue,
            durationUnit,
            startingLocation,
            interests,
            travelStyle
          },
          disqualifiedCount: disqualified.length,
          helpfulHint,
          suggestedAdjustments: {
            recommendedMinimumBudgetINR: minPossibleCost,
            recommendedMinimumDays: minDurationPossible
          }
        }
      });
    }

    // 5. Calculate Matching Scores & Rank Results
    const criteria = {
      budgetINR,
      availableDays,
      interests,
      travelStyle,
      startingLocation
    };

    const scoredDestinations = eligible.map((dest) => scoreDestination(dest, criteria));

    // Sort descending by finalScore, tiebreak with averageRating
    scoredDestinations.sort((a, b) => b.finalScore - a.finalScore || b.averageRating - a.averageRating);

    // 6. Fetch recent discoveries for repeat avoidance (past 30 days)
    let recentlyDiscoveredIds = [];
    if (userId) {
      const pastDiscoveries = await DiscoveryHistory.find({
        user: userId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
        .select('destination')
        .lean();

      recentlyDiscoveredIds = pastDiscoveries.map((p) => p.destination?.toString()).filter(Boolean);
    }

    // 7. Select Mystery Destination from highest-ranked eligible group
    const mysteryResult = selectMysteryDestination(scoredDestinations, recentlyDiscoveredIds);
    const selected = formatDestination(mysteryResult.selected);

    // 8. Save Discovery to DiscoveryHistory collection
    let historyEntry = null;
    try {
      historyEntry = await DiscoveryHistory.create({
        user: userId,
        destination: selected._id,
        matchScore: selected.finalScore,
        scoreBreakdown: {
          interestsScore: selected.scoreBreakdown.interestsScore,
          budgetScore: selected.scoreBreakdown.budgetScore,
          durationScore: selected.scoreBreakdown.durationScore,
          travelStyleScore: selected.scoreBreakdown.travelStyleScore
        },
        matchingReasons: selected.matchingReasons,
        costEstimate: selected.costEstimate,
        searchCriteria: {
          budgetINR,
          availableDays,
          durationValue,
          durationUnit,
          startingLocation,
          travelStyle,
          interests
        },
        topTierCandidatesCount: mysteryResult.topTierPoolSize
      });
    } catch (saveErr) {
      console.warn('Failed to record discovery in history:', saveErr.message);
    }

    // Top alternative runner-ups (excluding selected)
    const alternativeMatches = scoredDestinations
      .filter((d) => d._id.toString() !== selected._id.toString())
      .slice(0, 3)
      .map(formatDestination);

    return apiSuccess(res, {
      statusCode: 200,
      message: 'Mystery destination discovered successfully!',
      data: {
        qualified: true,
        destination: selected,
        matchScore: selected.finalScore,
        scoreBreakdown: selected.scoreBreakdown,
        matchingReasons: selected.matchingReasons,
        costEstimate: selected.costEstimate,
        algorithmMetrics: {
          totalEvaluated: allDestinations.length,
          eligibleCount: eligible.length,
          topTierPoolSize: mysteryResult.topTierPoolSize,
          repeatsAvoided: mysteryResult.avoidedRepeatsCount
        },
        alternativeMatches,
        historyId: historyEntry ? historyEntry._id : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/discovery/history
 * Retrieve user discovery history
 */
export const getDiscoveryHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const history = await DiscoveryHistory.find({ user: userId })
      .populate('destination')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return apiSuccess(res, {
      message: 'Discovery history retrieved successfully',
      data: {
        history: history.map((item) => ({
          ...item,
          destination: formatDestination(item.destination)
        })),
        count: history.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/discovery/starting-locations
 * Available Indian starting locations with zones
 */
export const getStartingLocations = async (req, res) => {
  return apiSuccess(res, {
    message: 'Indian starting locations retrieved successfully',
    data: {
      locations: INDIAN_STARTING_LOCATIONS
    }
  });
};

export default {
  spinMysteryDestination,
  getDiscoveryHistory,
  getStartingLocations
};
