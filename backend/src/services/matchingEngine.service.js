import { checkLocationCompatibility } from '../utils/indianLocations.js';

/**
 * Weights per specification
 */
export const WEIGHTS = {
  INTERESTS: 0.40,
  BUDGET: 0.30,
  DURATION: 0.20,
  STYLE: 0.10
};

/**
 * Style synergy mapping for smooth grading
 */
const STYLE_SYNERGIES = {
  solo: ['backpacker', 'adventure', 'cultural'],
  backpacker: ['solo', 'adventure', 'relaxation'],
  couple: ['relaxation', 'luxury', 'cultural'],
  luxury: ['couple', 'relaxation', 'cultural'],
  family: ['cultural', 'relaxation', 'nature'],
  adventure: ['nature', 'solo', 'backpacker', 'wildlife'],
  relaxation: ['nature', 'couple', 'luxury'],
  cultural: ['history', 'spiritual', 'family']
};

/**
 * Convert duration input into normalized days
 * @param {number} value
 * @param {'days' | 'hours'} unit
 * @returns {number}
 */
export const normalizeDurationToDays = (value, unit = 'days') => {
  if (!value || value <= 0) return 3; // sensible default
  if (unit === 'hours') {
    return Math.max(0.5, Math.round((value / 24) * 10) / 10);
  }
  return Number(value);
};

/**
 * 1. Filter out destinations that exceed budget or available duration
 * @param {Array} destinations
 * @param {{ budgetINR: number, availableDays: number, startingLocation?: string }} criteria
 * @returns {{ eligible: Array, disqualified: Array }}
 */
export const filterDestinations = (destinations, criteria) => {
  const { budgetINR, availableDays, startingLocation } = criteria;
  const eligible = [];
  const disqualified = [];

  for (const dest of destinations) {
    const dailyCost = dest.estimatedDailyCostINR || (dest.estimatedDailyCostUSD ? dest.estimatedDailyCostUSD * 85 : 2500);
    const totalCost = Math.round(dailyCost * availableDays);

    // Rule 1: Filter out destinations that exceed the budget
    if (budgetINR && totalCost > budgetINR) {
      disqualified.push({
        destination: dest,
        reason: `Exceeds budget: estimated ₹${totalCost.toLocaleString()} exceeds your ₹${budgetINR.toLocaleString()} limit.`
      });
      continue;
    }

    // Rule 2: Filter out destinations that exceed available duration (i.e. available duration is less than minimum stay)
    if (availableDays < dest.minDurationDays) {
      disqualified.push({
        destination: dest,
        reason: `Insufficient duration: requires minimum ${dest.minDurationDays} days, but you have ${availableDays} days.`
      });
      continue;
    }

    // Rule 3: Verify starting-location transit compatibility
    if (startingLocation) {
      const locCheck = checkLocationCompatibility(startingLocation, dest.state, availableDays);
      if (!locCheck.compatible) {
        disqualified.push({
          destination: dest,
          reason: locCheck.reason
        });
        continue;
      }
    }

    // Passed all boundary filters
    eligible.push({
      ...dest,
      computedDailyCostINR: dailyCost,
      computedTotalCostINR: totalCost
    });
  }

  return { eligible, disqualified };
};

/**
 * 2. Calculate Interest Matching Score (0 - 100) - 40% Weight
 * @param {Array<string>} userInterests
 * @param {Array<string>} destinationInterests
 * @returns {{ score: number, matchedInterests: Array<string> }}
 */
export const calculateInterestScore = (userInterests = [], destinationInterests = []) => {
  if (!userInterests || userInterests.length === 0) {
    return { score: 75, matchedInterests: [] }; // Neutral baseline when user has no preference
  }

  const destLower = (destinationInterests || []).map((i) => i.toLowerCase().trim());
  const userLower = userInterests.map((i) => i.toLowerCase().trim());

  const matched = userLower.filter((interest) =>
    destLower.some((d) => d.includes(interest) || interest.includes(d))
  );

  const overlapRatio = matched.length / userLower.length;
  const score = Math.round(Math.min(100, overlapRatio * 100));

  return { score, matchedInterests: matched };
};

/**
 * 3. Calculate Budget Compatibility Score (0 - 100) - 30% Weight
 * Since over-budget destinations are already filtered out, totalCost <= budget.
 * Optimal utilization is between 60% and 85% of budget.
 * @param {number} totalCost
 * @param {number} budgetINR
 * @returns {{ score: number, utilizationPercent: number, savingsINR: number }}
 */
export const calculateBudgetScore = (totalCost, budgetINR) => {
  if (!budgetINR || budgetINR <= 0) {
    return { score: 80, utilizationPercent: 100, savingsINR: 0 };
  }

  const ratio = totalCost / budgetINR;
  const utilizationPercent = Math.round(ratio * 100);
  const savingsINR = Math.max(0, budgetINR - totalCost);

  let score;
  if (ratio >= 0.60 && ratio <= 0.85) {
    // Sweet spot: high quality experience with comfortable 15-40% savings buffer
    score = 100;
  } else if (ratio < 0.60) {
    // Substantial budget left over (good, but potentially leaves value on the table)
    score = Math.round(Math.max(45, 100 - (0.60 - ratio) * 100));
  } else {
    // Tight budget (ratio between 0.85 and 1.00)
    score = Math.round(Math.max(50, 100 - (ratio - 0.85) * 250));
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    utilizationPercent,
    savingsINR
  };
};

/**
 * 4. Calculate Duration Compatibility Score (0 - 100) - 20% Weight
 * Evaluates how ideally the duration fits destination min and max stay.
 * @param {number} availableDays
 * @param {number} minDurationDays
 * @param {number} maxDurationDays
 * @returns {number}
 */
export const calculateDurationScore = (availableDays, minDurationDays = 2, maxDurationDays = 7) => {
  if (availableDays >= minDurationDays && availableDays <= maxDurationDays) {
    return 100; // Perfect duration window
  }

  if (availableDays > maxDurationDays) {
    // Traveler has extra days: gentle penalty of 10 points per excess day
    const excess = availableDays - maxDurationDays;
    return Math.round(Math.max(45, 100 - (excess * 10)));
  }

  // If slightly below (borderline case), proportional score
  const fraction = availableDays / Math.max(minDurationDays, 1);
  return Math.round(Math.max(0, fraction * 100));
};

/**
 * 5. Calculate Travel Style Compatibility Score (0 - 100) - 10% Weight
 * @param {string} userStyle
 * @param {Array<string>} destinationStyles
 * @returns {number}
 */
export const calculateTravelStyleScore = (userStyle, destinationStyles = []) => {
  if (!userStyle || !userStyle.trim()) {
    return 80; // Neutral baseline when flexible
  }

  const target = userStyle.toLowerCase().trim();
  const stylesLower = (destinationStyles || []).map((s) => s.toLowerCase().trim());

  // Direct match
  if (stylesLower.includes(target)) {
    return 100;
  }

  // Synergy match
  const synergies = STYLE_SYNERGIES[target] || [];
  if (stylesLower.some((s) => synergies.includes(s))) {
    return 70;
  }

  return 35;
};

/**
 * 6. Score and Rank an Eligible Destination
 * @param {Object} dest
 * @param {{ budgetINR: number, availableDays: number, interests: Array<string>, travelStyle: string, startingLocation?: string }} criteria
 * @returns {Object}
 */
export const scoreDestination = (dest, criteria) => {
  const { budgetINR, availableDays, interests, travelStyle, startingLocation } = criteria;

  const totalCost = dest.computedTotalCostINR || Math.round((dest.estimatedDailyCostINR || 2500) * availableDays);
  const dailyCost = dest.computedDailyCostINR || dest.estimatedDailyCostINR || 2500;

  // Compute individual normalized components (each 0 - 100)
  const interestResult = calculateInterestScore(interests, dest.interests);
  const budgetResult = calculateBudgetScore(totalCost, budgetINR);
  const durationScore = calculateDurationScore(availableDays, dest.minDurationDays, dest.maxDurationDays);
  const styleScore = calculateTravelStyleScore(travelStyle, dest.travelStyles);

  // Compute weighted final score
  const finalScore = Math.round(
    ((interestResult.score * WEIGHTS.INTERESTS) +
     (budgetResult.score * WEIGHTS.BUDGET) +
     (durationScore * WEIGHTS.DURATION) +
     (styleScore * WEIGHTS.STYLE)) * 10
  ) / 10;

  // Build transparent matching reasons
  const matchingReasons = [];
  if (interestResult.matchedInterests.length > 0) {
    matchingReasons.push(
      `Matches ${interestResult.matchedInterests.length} of your chosen interests: ${interestResult.matchedInterests.join(', ')}.`
    );
  }
  if (budgetINR) {
    matchingReasons.push(
      `Estimated trip cost ₹${totalCost.toLocaleString()} comfortably fits your ₹${budgetINR.toLocaleString()} budget with ₹${budgetResult.savingsINR.toLocaleString()} in reserve.`
    );
  }
  if (availableDays >= dest.minDurationDays && availableDays <= dest.maxDurationDays) {
    matchingReasons.push(
      `Ideal duration: your ${availableDays}-day stay is in the sweet spot for ${dest.name} (${dest.minDurationDays}-${dest.maxDurationDays} days).`
    );
  }
  if (travelStyle && dest.travelStyles?.includes(travelStyle.toLowerCase())) {
    matchingReasons.push(`Renowned for ${travelStyle} travel style.`);
  }
  if (startingLocation) {
    const loc = checkLocationCompatibility(startingLocation, dest.state, availableDays);
    if (loc.reason) matchingReasons.push(loc.reason);
  }

  return {
    ...dest,
    finalScore,
    scoreBreakdown: {
      interestsScore: interestResult.score,
      budgetScore: budgetResult.score,
      durationScore,
      travelStyleScore: styleScore,
      weights: {
        interests: '40%',
        budget: '30%',
        duration: '20%',
        travelStyle: '10%'
      }
    },
    matchingReasons,
    costEstimate: {
      estimatedDailyCostINR: dailyCost,
      totalEstimatedCostINR: totalCost,
      userBudgetINR: budgetINR || null,
      savingsRemainingINR: budgetResult.savingsINR,
      currency: 'INR'
    }
  };
};

/**
 * 7. Mystery Selection with Repeat Avoidance
 * Picks a random destination from the top-ranked group, avoiding recent discoveries.
 * @param {Array} rankedDestinations
 * @param {Array<string>} recentlyDiscoveredIds
 * @returns {Object}
 */
export const selectMysteryDestination = (rankedDestinations, recentlyDiscoveredIds = []) => {
  if (!rankedDestinations || rankedDestinations.length === 0) return null;

  // Top score
  const highestScore = rankedDestinations[0].finalScore;

  // Group top tier: destinations within 5 points of highest score, or minimum top 3
  const topTier = rankedDestinations.filter(
    (d, index) => d.finalScore >= highestScore - 5 || index < 3
  );

  // Repeat avoidance: filter out recently discovered IDs
  const recentSet = new Set((recentlyDiscoveredIds || []).map((id) => id.toString()));
  const freshCandidates = topTier.filter((d) => !recentSet.has((d._id || d.id).toString()));

  // If there are unvisited top candidates, pick from them; otherwise fallback to top tier
  const pool = freshCandidates.length > 0 ? freshCandidates : topTier;

  // Serendipitous random selection from highest-ranked eligible group
  const randomIndex = Math.floor(Math.random() * pool.length);
  return {
    selected: pool[randomIndex],
    candidatesEvaluated: rankedDestinations.length,
    topTierPoolSize: pool.length,
    avoidedRepeatsCount: topTier.length - freshCandidates.length
  };
};

export default {
  WEIGHTS,
  normalizeDurationToDays,
  filterDestinations,
  calculateInterestScore,
  calculateBudgetScore,
  calculateDurationScore,
  calculateTravelStyleScore,
  scoreDestination,
  selectMysteryDestination
};
