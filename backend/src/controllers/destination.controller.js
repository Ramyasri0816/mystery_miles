import Destination from '../models/Destination.model.js';
import DiscoveryHistory from '../models/DiscoveryHistory.model.js';
import Review from '../models/Review.model.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const formatDestination = (dest) => {
  if (!dest) return dest;
  const primaryImage =
    dest.imageUrl ||
    (Array.isArray(dest.imageUrls) && dest.imageUrls.length > 0 ? dest.imageUrls[0] : '') ||
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

  return {
    ...dest,
    imageUrl: primaryImage,
    imageUrls: Array.isArray(dest.imageUrls) && dest.imageUrls.length > 0 ? dest.imageUrls : [primaryImage]
  };
};

/**
 * List all destinations with filtering, full-text search, pagination and sorting
 */
export const getDestinations = async (req, res, next) => {
  try {
    const {
      search,
      category,
      state,
      budgetTier,
      minDailyBudget,
      maxDailyBudget,
      travelStyle,
      season,
      interests,
      minRating,
      sortBy,
      page,
      limit
    } = req.query;

    const query = {};

    // 1. Text Search or regex search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { highlights: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    // 2. Filters
    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }
    if (state) {
      query.state = { $regex: `^${state}$`, $options: 'i' };
    }
    if (budgetTier) {
      query.budgetTier = budgetTier;
    }
    if (minDailyBudget !== undefined || maxDailyBudget !== undefined) {
      query.estimatedDailyCostINR = {};
      if (minDailyBudget !== undefined) query.estimatedDailyCostINR.$gte = minDailyBudget;
      if (maxDailyBudget !== undefined) query.estimatedDailyCostINR.$lte = maxDailyBudget;
    }
    if (travelStyle) {
      query.travelStyles = { $in: [new RegExp(`^${travelStyle}$`, 'i')] };
    }
    if (season) {
      query.bestSeasons = { $in: [new RegExp(`^${season}$`, 'i')] };
    }
    if (interests && interests.length > 0) {
      query.interests = { $in: interests.map((i) => new RegExp(`^${i}$`, 'i')) };
    }
    if (minRating !== undefined) {
      query.averageRating = { $gte: minRating };
    }

    // 3. Sorting
    let sortOptions = {};
    switch (sortBy) {
      case 'price_asc':
        sortOptions = { estimatedDailyCostINR: 1 };
        break;
      case 'price_desc':
        sortOptions = { estimatedDailyCostINR: -1 };
        break;
      case 'duration':
        sortOptions = { minDurationDays: 1 };
        break;
      case 'name':
        sortOptions = { name: 1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'rating':
      default:
        sortOptions = { averageRating: -1, reviewCount: -1 };
        break;
    }

    // 4. Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [destinations, total] = await Promise.all([
      Destination.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Destination.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return apiSuccess(res, {
      message: 'Destinations retrieved successfully',
      data: {
        destinations: destinations.map(formatDestination),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single destination by ID with recent reviews
 */
export const getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findById(id).lean();
    if (!destination) {
      return apiError(res, {
        statusCode: 404,
        message: 'Destination not found.'
      });
    }

    // Fetch recent 5 reviews
    const recentReviews = await Review.find({ destination: id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return apiSuccess(res, {
      message: 'Destination retrieved successfully',
      data: {
        destination: formatDestination(destination),
        recentReviews
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to calculate personalized match score (40 - 99%)
 */
const calculateMatchScore = (dest, criteria) => {
  let score = 50; // base score

  const { budget, budgetTier, availableTimeDays, interests, travelStyle, season, startingLocation } = criteria;

  // 1. Budget Score
  if (budgetTier && budgetTier !== 'any') {
    if (dest.budgetTier === budgetTier) score += 18;
    else score -= 10;
  } else if (budget && availableTimeDays) {
    const totalEst = dest.estimatedDailyCostINR * availableTimeDays;
    if (totalEst <= budget) {
      score += 20;
    } else if (totalEst <= budget * 1.25) {
      score += 10;
    } else {
      score -= 15;
    }
  }

  // 2. Duration Score
  if (availableTimeDays) {
    if (availableTimeDays >= dest.minDurationDays && availableTimeDays <= dest.maxDurationDays) {
      score += 15;
    } else if (Math.abs(availableTimeDays - dest.minDurationDays) <= 1) {
      score += 8;
    }
  }

  // 3. Travel Style Score
  if (travelStyle && dest.travelStyles) {
    if (dest.travelStyles.some((s) => s.toLowerCase() === travelStyle.toLowerCase())) {
      score += 15;
    }
  }

  // 4. Interests Overlap
  if (interests && interests.length > 0 && dest.interests) {
    const matched = interests.filter((interest) =>
      dest.interests.some((i) => i.toLowerCase().includes(interest.toLowerCase()))
    );
    const overlapRatio = matched.length / interests.length;
    score += Math.round(overlapRatio * 20);
  }

  // 5. Season Affinity
  if (season && dest.bestSeasons) {
    if (dest.bestSeasons.some((s) => s.toLowerCase() === season.toLowerCase() || s.toLowerCase() === 'year-round')) {
      score += 10;
    }
  }

  // 6. Starting Location Proximity / Affinity
  if (startingLocation && startingLocation.trim()) {
    const startLoc = startingLocation.toLowerCase();
    if (dest.state.toLowerCase().includes(startLoc) || dest.name.toLowerCase().includes(startLoc)) {
      score += 5; // Local exploration bonus
    }
  }

  // Clamp between 45 and 99
  return Math.min(Math.max(score, 45), 99);
};

/**
 * Discover personalized destinations based on budget, duration, interests, starting location & style
 */
export const discoverDestinations = async (req, res, next) => {
  try {
    const {
      budget,
      budgetTier,
      availableTimeDays,
      interests,
      startingLocation,
      travelStyle,
      season,
      category,
      limit
    } = req.query;

    const filter = {};
    if (category) {
      filter.category = { $regex: `^${category}$`, $options: 'i' };
    }

    const allDestinations = await Destination.find(filter).lean();

    if (allDestinations.length === 0) {
      return apiSuccess(res, {
        message: 'No destinations found in the database. Run the seed script to populate destinations.',
        data: {
          destinations: [],
          criteria: req.query,
          totalMatches: 0
        }
      });
    }

    // Rank each destination based on criteria
    const scored = allDestinations.map((dest) => {
      const matchScore = calculateMatchScore(dest, {
        budget,
        budgetTier,
        availableTimeDays,
        interests,
        startingLocation,
        travelStyle,
        season
      });
      return {
        ...dest,
        matchScore
      };
    });

    // Sort descending by match score, then average rating
    scored.sort((a, b) => b.matchScore - a.matchScore || b.averageRating - a.averageRating);

    const maxResults = parseInt(limit, 10) || 12;
    const topMatches = scored.slice(0, maxResults);

    // Save discovery search in user history if authenticated
    if (req.user) {
      try {
        await DiscoveryHistory.create({
          user: req.user._id,
          searchCriteria: {
            budgetINR: budget || null,
            budgetTier: budgetTier || 'any',
            availableTimeDays: availableTimeDays || null,
            startingLocation: startingLocation || '',
            travelStyle: travelStyle || '',
            season: season || '',
            category: category || '',
            interests: interests || []
          },
          resultsCount: topMatches.length,
          topMatches: topMatches.slice(0, 5).map((d) => ({
            destination: d._id,
            name: d.name,
            state: d.state,
            matchScore: d.matchScore
          }))
        });
      } catch (histErr) {
        // Log but do not block discovery response
        console.warn('Failed to record discovery history:', histErr.message);
      }
    }

    return apiSuccess(res, {
      message: 'Personalized destinations discovered successfully',
      data: {
        destinations: topMatches.map(formatDestination),
        criteria: {
          budget: budget || null,
          budgetTier: budgetTier || 'any',
          availableTimeDays: availableTimeDays || null,
          startingLocation: startingLocation || 'Anywhere',
          travelStyle: travelStyle || 'Flexible',
          season: season || 'Any Season',
          interests: interests || []
        },
        totalMatches: topMatches.length
      }
    });
  } catch (error) {
    next(error);
  }
};
