import Destination from '../models/Destination.model.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { getDBStatus } from '../config/db.js';

// Curated seed dataset showcasing MysteryMiles personalized discovery
export const INITIAL_DESTINATIONS = [
  {
    _id: 'dest-1',
    name: 'Kyoto & The Japanese Alps',
    tagline: 'Ancient temples, bamboo groves, and misty alpine villages',
    city: 'Kyoto',
    country: 'Japan',
    continent: 'Asia',
    budgetTier: 'mid-range',
    estimatedDailyCostUSD: 140,
    minDurationDays: 5,
    maxDurationDays: 12,
    travelStyles: ['solo', 'couple', 'cultural', 'relaxation'],
    interests: ['culture', 'nature', 'food', 'history'],
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Fushimi Inari shrine path', 'Traditional tea ceremonies in Gion', 'Arashiyama bamboo grove'],
    rating: 4.9
  },
  {
    _id: 'dest-2',
    name: 'Interlaken & Jungfrau Alpine Region',
    tagline: 'Snow-capped peaks, azure lakes, and adrenaline sports',
    city: 'Interlaken',
    country: 'Switzerland',
    continent: 'Europe',
    budgetTier: 'luxury',
    estimatedDailyCostUSD: 280,
    minDurationDays: 4,
    maxDurationDays: 10,
    travelStyles: ['couple', 'adventure', 'luxury'],
    interests: ['adventure', 'nature', 'mountain'],
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Jungfraujoch Top of Europe', 'Lake Brienz boat cruise', 'Paragliding over alpine valleys'],
    rating: 4.8
  },
  {
    _id: 'dest-3',
    name: 'Oaxaca Culinary & Cultural Heartland',
    tagline: 'Vibrant street markets, mezcal distilleries, and indigenous art',
    city: 'Oaxaca',
    country: 'Mexico',
    continent: 'Americas',
    budgetTier: 'budget',
    estimatedDailyCostUSD: 55,
    minDurationDays: 3,
    maxDurationDays: 8,
    travelStyles: ['solo', 'backpacker', 'couple', 'cultural'],
    interests: ['food', 'culture', 'history'],
    imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Monte Albán Zapotec ruins', 'Artisanal mole tasting tour', 'Hierve el Agua petrified waterfalls'],
    rating: 4.7
  },
  {
    _id: 'dest-4',
    name: 'Reykjavik & The Golden Circle',
    tagline: 'Cascading waterfalls, black sand beaches, and Northern Lights',
    city: 'Reykjavik',
    country: 'Iceland',
    continent: 'Europe',
    budgetTier: 'luxury',
    estimatedDailyCostUSD: 240,
    minDurationDays: 4,
    maxDurationDays: 9,
    travelStyles: ['adventure', 'solo', 'couple'],
    interests: ['nature', 'adventure', 'wildlife'],
    imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Blue Lagoon geothermal spa', 'Gullfoss roaring waterfall', 'Thingvellir rift valley'],
    rating: 4.9
  },
  {
    _id: 'dest-5',
    name: 'Hoi An & Danang Coastal Haven',
    tagline: 'Lantern-lit ancient streets, emerald beaches, and tailoring craft',
    city: 'Hoi An',
    country: 'Vietnam',
    continent: 'Asia',
    budgetTier: 'budget',
    estimatedDailyCostUSD: 40,
    minDurationDays: 3,
    maxDurationDays: 10,
    travelStyles: ['solo', 'backpacker', 'family', 'relaxation'],
    interests: ['food', 'beach', 'culture', 'relaxation'],
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Night market lanterns by Thu Bon River', 'An Bang beach sunsets', 'Cycling through coconut groves'],
    rating: 4.8
  },
  {
    _id: 'dest-6',
    name: 'Amalfi Coast & Capri Escape',
    tagline: 'Pastel cliffside villages, lemon groves, and crystal Mediterranean water',
    city: 'Positano',
    country: 'Italy',
    continent: 'Europe',
    budgetTier: 'luxury',
    estimatedDailyCostUSD: 310,
    minDurationDays: 4,
    maxDurationDays: 8,
    travelStyles: ['couple', 'luxury', 'relaxation'],
    interests: ['food', 'relaxation', 'beach', 'culture'],
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Path of the Gods hike', 'Private boat tour around Faraglioni', 'Limoncello tasting on terrace'],
    rating: 4.9
  },
  {
    _id: 'dest-7',
    name: 'Queenstown Adventure Capital',
    tagline: 'Dramatic fjords, bungee jumping, and stargazing in Southern Alps',
    city: 'Queenstown',
    country: 'New Zealand',
    continent: 'Oceania',
    budgetTier: 'mid-range',
    estimatedDailyCostUSD: 165,
    minDurationDays: 5,
    maxDurationDays: 14,
    travelStyles: ['adventure', 'solo', 'couple'],
    interests: ['adventure', 'nature', 'mountain', 'wildlife'],
    imageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Milford Sound cruise', 'Kawarau Bridge bungee jump', 'Onsen Hot Pools overlooking the canyon'],
    rating: 4.9
  },
  {
    _id: 'dest-8',
    name: 'Cape Town & Cape Peninsula',
    tagline: 'Where dramatic ocean cliffs meet world-class vineyards and penguins',
    city: 'Cape Town',
    country: 'South Africa',
    continent: 'Africa',
    budgetTier: 'mid-range',
    estimatedDailyCostUSD: 95,
    minDurationDays: 5,
    maxDurationDays: 12,
    travelStyles: ['solo', 'couple', 'adventure', 'cultural'],
    interests: ['nature', 'wildlife', 'beach', 'food', 'adventure'],
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Table Mountain cable car', 'Boulders Beach African penguin colony', 'Cape Point scenic drive'],
    rating: 4.8
  }
];

/**
 * Score a destination based on user discovery preferences
 */
const scoreDestination = (dest, criteria) => {
  let score = 50; // base score

  const { budget, budgetTier, availableTimeDays, interests, travelStyle } = criteria;

  // 1. Budget scoring
  if (budgetTier && budgetTier !== 'any') {
    if (dest.budgetTier === budgetTier) score += 20;
    else score -= 10;
  } else if (budget && availableTimeDays) {
    const totalEst = dest.estimatedDailyCostUSD * availableTimeDays;
    if (totalEst <= budget) {
      score += 20;
    } else if (totalEst <= budget * 1.25) {
      score += 10;
    } else {
      score -= 20;
    }
  }

  // 2. Duration match
  if (availableTimeDays) {
    if (availableTimeDays >= dest.minDurationDays && availableTimeDays <= dest.maxDurationDays) {
      score += 15;
    } else if (Math.abs(availableTimeDays - dest.minDurationDays) <= 1) {
      score += 8;
    }
  }

  // 3. Travel style match
  if (travelStyle) {
    if (dest.travelStyles.some((s) => s.toLowerCase() === travelStyle.toLowerCase())) {
      score += 15;
    }
  }

  // 4. Interests overlap
  if (interests && interests.length > 0) {
    const matched = interests.filter((interest) =>
      dest.interests.some((i) => i.toLowerCase().includes(interest.toLowerCase()))
    );
    const overlapRatio = matched.length / interests.length;
    score += Math.round(overlapRatio * 20);
  }

  // Normalize score between 40 and 99
  return Math.min(Math.max(score, 45), 98);
};

export const discoverDestinations = async (req, res, next) => {
  try {
    const { budget, budgetTier, availableTimeDays, interests, startingLocation, travelStyle } = req.query;

    let destinations = INITIAL_DESTINATIONS;

    // Check if connected to MongoDB and has data
    if (getDBStatus() === 'connected') {
      const dbDestinations = await Destination.find().lean();
      if (dbDestinations && dbDestinations.length > 0) {
        destinations = dbDestinations;
      }
    }

    // Rank and score based on user preferences
    const scored = destinations.map((dest) => {
      const matchScore = scoreDestination(dest, {
        budget,
        budgetTier,
        availableTimeDays,
        interests,
        startingLocation,
        travelStyle
      });
      return {
        ...dest,
        matchScore
      };
    });

    // Sort descending by matchScore
    scored.sort((a, b) => b.matchScore - a.matchScore);

    return apiSuccess(res, {
      message: 'Personalized destinations discovered successfully',
      data: {
        destinations: scored,
        criteria: {
          budget: budget || null,
          budgetTier: budgetTier || 'any',
          availableTimeDays: availableTimeDays || null,
          interests: interests || [],
          startingLocation: startingLocation || 'Anywhere',
          travelStyle: travelStyle || 'Flexible'
        },
        totalResults: scored.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDestinations = async (req, res, next) => {
  try {
    let destinations = INITIAL_DESTINATIONS;

    if (getDBStatus() === 'connected') {
      const dbDestinations = await Destination.find().lean();
      if (dbDestinations && dbDestinations.length > 0) {
        destinations = dbDestinations;
      }
    }

    return apiSuccess(res, {
      data: { destinations, count: destinations.length }
    });
  } catch (error) {
    next(error);
  }
};

export const getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let dest = INITIAL_DESTINATIONS.find((d) => d._id === id);

    if (!dest && getDBStatus() === 'connected') {
      dest = await Destination.findById(id).lean();
    }

    if (!dest) {
      return apiError(res, {
        statusCode: 404,
        message: 'Destination not found'
      });
    }

    return apiSuccess(res, {
      data: { destination: dest }
    });
  } catch (error) {
    next(error);
  }
};
