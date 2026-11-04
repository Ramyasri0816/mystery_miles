import mongoose from 'mongoose';
import app from '../src/app.js';
import env from '../src/config/env.js';
import User from '../src/models/User.model.js';
import Destination from '../src/models/Destination.model.js';
import DiscoveryHistory from '../src/models/DiscoveryHistory.model.js';
import {
  normalizeDurationToDays,
  filterDestinations,
  calculateInterestScore,
  calculateBudgetScore,
  calculateDurationScore,
  calculateTravelStyleScore,
  scoreDestination,
  selectMysteryDestination,
  WEIGHTS
} from '../src/services/matchingEngine.service.js';

let server;
let baseUrl;

const runMatchingEngineTests = async () => {
  console.log('================================================================');
  console.log('🎯 MYSTERY DESTINATION MATCHING ENGINE ALGORITHM TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title} ${details ? '- ' + details : ''}`);
      failed++;
    }
  };

  try {
    // -------------------------------------------------------------
    // UNIT TEST 1: Duration Normalization (Hours vs Days)
    // -------------------------------------------------------------
    console.log('[1/7] Unit Testing Duration Normalization...');
    const daysFromHours = normalizeDurationToDays(72, 'hours');
    assert(daysFromHours === 3, '72 hours correctly normalizes to 3 days');

    const daysFromFractionalHours = normalizeDurationToDays(36, 'hours');
    assert(daysFromFractionalHours === 1.5, '36 hours correctly normalizes to 1.5 days');

    const directDays = normalizeDurationToDays(5, 'days');
    assert(directDays === 5, 'Direct 5 days input preserved');

    // -------------------------------------------------------------
    // UNIT TEST 2: Strict Boundary Filtering (Budget & Duration)
    // -------------------------------------------------------------
    console.log('\n[2/7] Unit Testing Strict Boundary Filtering...');
    const testDestinations = [
      {
        _id: 'd1',
        name: 'Affordable Hill Station',
        state: 'Uttarakhand',
        estimatedDailyCostINR: 1500,
        minDurationDays: 2,
        maxDurationDays: 5,
        interests: ['mountain', 'nature'],
        travelStyles: ['solo', 'backpacker']
      },
      {
        _id: 'd2',
        name: 'Luxury Royal Palace',
        state: 'Rajasthan',
        estimatedDailyCostINR: 6000,
        minDurationDays: 3,
        maxDurationDays: 6,
        interests: ['culture', 'history'],
        travelStyles: ['couple', 'luxury']
      },
      {
        _id: 'd3',
        name: 'Extended Trek Expedition',
        state: 'Ladakh',
        estimatedDailyCostINR: 2500,
        minDurationDays: 6, // requires min 6 days!
        maxDurationDays: 12,
        interests: ['adventure', 'mountain'],
        travelStyles: ['adventure']
      }
    ];

    // Filter with ₹8,000 budget and 3 days available
    // d1 total = 1500 * 3 = 4500 (Fits budget <= 8000, Fits duration 3 >= 2) -> ELIGIBLE
    // d2 total = 6000 * 3 = 18000 (Exceeds budget 18000 > 8000) -> DISQUALIFIED
    // d3 total = 2500 * 3 = 7500 (Fits budget, but duration 3 < 6 min) -> DISQUALIFIED
    const { eligible, disqualified } = filterDestinations(testDestinations, {
      budgetINR: 8000,
      availableDays: 3
    });

    assert(eligible.length === 1 && eligible[0].name === 'Affordable Hill Station', 'Only affordable destination within budget and min stay qualified');
    assert(disqualified.some((d) => d.destination.name === 'Luxury Royal Palace' && d.reason.includes('Exceeds budget')), 'Luxury Palace filtered out due to budget boundary violation');
    assert(disqualified.some((d) => d.destination.name === 'Extended Trek Expedition' && d.reason.includes('Insufficient duration')), 'Extended Trek filtered out due to duration limit violation');

    // -------------------------------------------------------------
    // UNIT TEST 3: Individual Scoring Components & Normalization
    // -------------------------------------------------------------
    console.log('\n[3/7] Unit Testing Individual Scoring Components (0 - 100)...');

    // A. Interest Matching (40% Weight)
    const intPerfect = calculateInterestScore(['mountain', 'nature'], ['mountain', 'nature', 'spiritual']);
    assert(intPerfect.score === 100, 'Perfect interest overlap yields 100% interest score');

    const intPartial = calculateInterestScore(['mountain', 'beach'], ['mountain', 'nature']);
    assert(intPartial.score === 50, '1 of 2 interests overlap yields 50% interest score');

    const intZero = calculateInterestScore(['beach'], ['mountain', 'desert']);
    assert(intZero.score === 0, 'Zero interest overlap yields 0% interest score');

    // B. Budget Compatibility (30% Weight)
    // Optimal utilization ratio = 60% to 85%
    const budgetOptimal = calculateBudgetScore(7500, 10000); // 75% utilization
    assert(budgetOptimal.score === 100, 'Optimal budget utilization (75%) scores 100');
    assert(budgetOptimal.savingsINR === 2500, 'Savings correctly calculated as ₹2,500');

    const budgetLowUtil = calculateBudgetScore(2000, 10000); // 20% utilization
    assert(budgetLowUtil.score >= 40 && budgetLowUtil.score < 100, 'Low utilization (<60%) produces normalized scaled score');

    const budgetTight = calculateBudgetScore(9500, 10000); // 95% utilization
    assert(budgetTight.score >= 50 && budgetTight.score < 100, 'Near-ceiling budget utilization (95%) produces normalized scaled score');

    // C. Duration Compatibility (20% Weight)
    const durPerfect = calculateDurationScore(4, 2, 5); // 4 days within [2, 5]
    assert(durPerfect === 100, 'Duration inside recommended range [2, 5] scores 100');

    const durExcess = calculateDurationScore(9, 2, 5); // 4 days excess
    assert(durExcess === 60, 'Duration exceeding max by 4 days penalized proportionally (100 - 40 = 60)');

    // D. Travel Style Compatibility (10% Weight)
    const styleDirect = calculateTravelStyleScore('solo', ['solo', 'backpacker']);
    assert(styleDirect === 100, 'Direct travel style match scores 100');

    const styleSynergy = calculateTravelStyleScore('solo', ['adventure', 'cultural']); // solo synergy with adventure
    assert(styleSynergy === 70, 'Synergistic travel style match scores 70');

    const styleMismatch = calculateTravelStyleScore('luxury', ['backpacker']);
    assert(styleMismatch === 35, 'Travel style mismatch scores baseline 35');

    // -------------------------------------------------------------
    // UNIT TEST 4: Weighted Mathematical Formula Verification
    // -------------------------------------------------------------
    console.log('\n[4/7] Unit Testing Weighted Mathematical Formula...');
    const scoredSample = scoreDestination(testDestinations[0], {
      budgetINR: 6000,
      availableDays: 3,
      interests: ['mountain', 'nature'], // 100% -> 100 * 0.40 = 40.0
      travelStyle: 'solo'               // 100% -> 100 * 0.10 = 10.0
      // Daily cost 1500 * 3 = 4500 / 6000 = 75% -> 100 * 0.30 = 30.0
      // Duration 3 in [2, 5] -> 100 * 0.20 = 20.0
      // Total expected: 40 + 30 + 20 + 10 = 100.0
    });

    assert(scoredSample.finalScore === 100, 'Formula calculates expected 100.0 for perfect alignment (40% + 30% + 20% + 10%)');
    assert(scoredSample.scoreBreakdown.interestsScore === 100, 'Score breakdown reports 100 for interests');
    assert(scoredSample.scoreBreakdown.budgetScore === 100, 'Score breakdown reports 100 for budget');
    assert(scoredSample.scoreBreakdown.durationScore === 100, 'Score breakdown reports 100 for duration');
    assert(scoredSample.scoreBreakdown.travelStyleScore === 100, 'Score breakdown reports 100 for style');
    assert(scoredSample.matchingReasons.length >= 3, 'Scored destination contains explainable matching reasons');

    // -------------------------------------------------------------
    // UNIT TEST 5: Repeat Avoidance Logic
    // -------------------------------------------------------------
    console.log('\n[5/7] Unit Testing Repeat Avoidance Logic...');
    const rankedCandidates = [
      { _id: 'dest_A', name: 'Destination A', finalScore: 95 },
      { _id: 'dest_B', name: 'Destination B', finalScore: 94 },
      { _id: 'dest_C', name: 'Destination C', finalScore: 92 }
    ];

    // User recently discovered Destination A
    const repeatResult = selectMysteryDestination(rankedCandidates, ['dest_A']);
    assert(
      repeatResult.selected._id === 'dest_B' || repeatResult.selected._id === 'dest_C',
      'Recent discovery dest_A successfully bypassed in favor of fresh candidate (' + repeatResult.selected.name + ')'
    );
    assert(repeatResult.avoidedRepeatsCount === 1, 'Avoided repeats counter accurately logged');

    // Fallback when all candidates were recently discovered
    const allSeenResult = selectMysteryDestination(rankedCandidates, ['dest_A', 'dest_B', 'dest_C']);
    assert(Boolean(allSeenResult.selected), 'When all candidates have been seen, gracefully selects from top tier pool without crashing');

    // -------------------------------------------------------------
    // INTEGRATION TEST 6: Live MongoDB Database Discovery Spin
    // -------------------------------------------------------------
    console.log('\n[6/7] Integration Testing POST /api/discovery/spin with MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    assert(mongoose.connection.readyState === 1, 'Connected to live MongoDB database');

    // Spin ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}/api`;
        resolve();
      });
    });

    const spinRes = await fetch(`${baseUrl}/discovery/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budget: 15000,
        durationValue: 4,
        durationUnit: 'days',
        startingLocation: 'Mumbai',
        interests: ['beach', 'relaxation', 'food'],
        travelStyle: 'couple'
      })
    });
    const spinData = await spinRes.json();

    assert(spinRes.status === 200, 'POST /api/discovery/spin returns HTTP 200');
    assert(spinData.data.qualified === true, 'Engine found qualified destinations in MongoDB');
    assert(Boolean(spinData.data.destination.name), 'Selected mystery destination returned (' + spinData.data.destination.name + ')');
    assert(spinData.data.matchScore >= 50, 'Match score calculated and above threshold (' + spinData.data.matchScore + '%)');
    assert(spinData.data.matchingReasons.length > 0, 'Matching reasons list populated');
    assert(spinData.data.costEstimate.totalEstimatedCostINR <= 15000, 'Total estimated cost verified <= user budget of ₹15,000');
    assert(spinData.data.alternativeMatches.length > 0, 'Alternative runner-up matches supplied');

    // -------------------------------------------------------------
    // INTEGRATION TEST 7: Empty Results Handling & Diagnostics
    // -------------------------------------------------------------
    console.log('\n[7/7] Testing Impossible Filter Diagnostics & Starting Locations...');
    const impossibleSpinRes = await fetch(`${baseUrl}/discovery/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budget: 600, // Impossibly low budget for 10 days
        durationValue: 10,
        durationUnit: 'days',
        startingLocation: 'Delhi'
      })
    });
    const impossibleData = await impossibleSpinRes.json();

    assert(impossibleSpinRes.status === 200, 'Impossible criteria returns 200 with qualified: false');
    assert(impossibleData.data.qualified === false, 'Correctly flags qualified: false');
    assert(Boolean(impossibleData.data.helpfulHint), 'Helpful diagnostic message provided: "' + impossibleData.data.helpfulHint.slice(0, 70) + '..."');
    assert(impossibleData.data.suggestedAdjustments.recommendedMinimumBudgetINR > 600, 'Suggests realistic minimum budget needed');

    // Test Starting Locations Endpoint
    const locRes = await fetch(`${baseUrl}/discovery/starting-locations`);
    const locData = await locRes.json();
    assert(locRes.status === 200, 'GET /api/discovery/starting-locations returns 200 OK');
    assert(locData.data.locations.length >= 20, 'Returns at least 20 Indian starting hubs across all zones (found ' + locData.data.locations.length + ')');

    console.log('\n================================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
};

runMatchingEngineTests();
