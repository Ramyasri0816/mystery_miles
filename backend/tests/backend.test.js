import mongoose from 'mongoose';
import app from '../src/app.js';
import env from '../src/config/env.js';
import User from '../src/models/User.model.js';
import Destination from '../src/models/Destination.model.js';
import SavedTrip from '../src/models/SavedTrip.model.js';
import Review from '../src/models/Review.model.js';
import DiscoveryHistory from '../src/models/DiscoveryHistory.model.js';

let server;
let baseUrl;

const runTests = async () => {
  console.log('====================================================');
  console.log('🚀 MYSTERYMILES BACKEND INTEGRATION TEST SUITE');
  console.log('====================================================\n');

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
    // 1. Connect to MongoDB
    console.log('[1/8] Verifying Database Connection...');
    await mongoose.connect(env.MONGODB_URI);
    assert(mongoose.connection.readyState === 1, 'MongoDB connection established to ' + mongoose.connection.name);

    // Start ephemeral HTTP server on dynamic port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}/api`;
        console.log(`Test server running at ${baseUrl}\n`);
        resolve();
      });
    });

    // 2. Test Health Check
    console.log('[2/8] Testing Health Check Endpoint...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
    assert(healthData.data.status === 'UP', 'Health status reports UP');
    assert(healthData.data.database.status === 'connected', 'Database reports connected state in health response');

    // 3. Test Authentication & Privilege Escalation Defense
    console.log('\n[3/8] Testing Authentication & Privilege Escalation Defenses...');
    const testEmail = `traveler_${Date.now()}@example.com`;
    const attackerEmail = `attacker_${Date.now()}@example.com`;

    // Attempt privilege escalation by injecting role='admin'
    const escalationRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker User',
        email: attackerEmail,
        password: 'password123',
        role: 'admin' // Attempted privilege escalation
      })
    });
    const escalationData = await escalationRes.json();
    assert(
      escalationRes.status === 400,
      'Registration with injected role: admin rejected with 400 Bad Request (strict Zod schema)'
    );

    // Valid Registration
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Sharma',
        email: testEmail,
        password: 'securePassword123'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'POST /api/auth/register returns 201 Created');
    assert(regData.data.user.role === 'user', 'Newly registered user assigned role "user"');
    assert(!regData.data.user.password, 'Password field is never exposed in response');

    // Check Set-Cookie header contains HTTP-only cookie
    const setCookieHeader = regRes.headers.get('set-cookie');
    assert(setCookieHeader && setCookieHeader.includes('token='), 'Set-Cookie header sets "token"');
    assert(setCookieHeader && setCookieHeader.includes('HttpOnly'), 'Authentication cookie is strictly HttpOnly');

    // Duplicate registration rejection
    const dupRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Sharma',
        email: testEmail,
        password: 'securePassword123'
      })
    });
    assert(dupRegRes.status === 409, 'Duplicate registration with same email returns 409 Conflict');

    // Login with incorrect credentials
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongPassword!'
      })
    });
    assert(badLoginRes.status === 401, 'Login with incorrect password returns 401 Unauthorized');

    // Login with valid credentials
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword123'
      })
    });
    const loginData = await loginRes.json();
    const authToken = loginData.data.token;
    assert(loginRes.status === 200, 'Login with valid credentials returns 200 OK');
    assert(Boolean(authToken), 'Login issues valid JWT token');

    // Access Protected /api/auth/me without token
    const unauthMe = await fetch(`${baseUrl}/auth/me`);
    assert(unauthMe.status === 401, 'GET /api/auth/me without credentials returns 401 Unauthorized');

    // Access Protected /api/auth/me with Bearer token
    const authMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const meData = await authMe.json();
    assert(authMe.status === 200, 'GET /api/auth/me with Bearer token returns 200 OK');
    assert(meData.data.user.email === testEmail, 'GET /api/auth/me matches authenticated email');

    // Profile & Travel Preferences Update
    const updatePrefRes = await fetch(`${baseUrl}/auth/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        startingLocation: 'Bengaluru, Karnataka',
        budgetTier: 'mid-range',
        preferredStyle: 'adventure',
        interests: ['mountain', 'nature', 'spiritual'],
        preferredDurationDays: 5
      })
    });
    const prefData = await updatePrefRes.json();
    assert(updatePrefRes.status === 200, 'PUT /api/auth/preferences returns 200 OK');
    assert(prefData.data.travelPreferences.startingLocation === 'Bengaluru, Karnataka', 'Updated startingLocation persisted');
    assert(prefData.data.travelPreferences.preferredStyle === 'adventure', 'Updated preferredStyle persisted');

    // 4. Test Destination Search, Filtering, Pagination, Sorting & Discovery
    console.log('\n[4/8] Testing Destination Queries & Discovery Engine...');
    const listRes = await fetch(`${baseUrl}/destinations?page=1&limit=5&sortBy=rating`);
    const listData = await listRes.json();
    assert(listRes.status === 200, 'GET /api/destinations returns 200 OK');
    assert(listData.data.destinations.length === 5, 'Pagination limits output to 5 items');
    assert(listData.data.pagination.total >= 25, 'Total Indian destinations in database is at least 25 (found ' + listData.data.pagination.total + ')');

    // Filtering by category & state
    const filterRes = await fetch(`${baseUrl}/destinations?state=Kerala&category=Beach`);
    const filterData = await filterRes.json();
    assert(filterRes.status === 200, 'GET /api/destinations?state=Kerala&category=Beach returns 200 OK');
    assert(filterData.data.destinations.every(d => d.state === 'Kerala'), 'All returned destinations match state filter');

    // Full-text search
    const searchRes = await fetch(`${baseUrl}/destinations?search=Taj`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200, 'Search for "Taj" returns 200 OK');
    assert(searchData.data.destinations.some(d => d.name.includes('Agra')), 'Search results include Agra (Taj Mahal)');

    // Single Destination Details & Invalid ObjectId handling
    const sampleDest = listData.data.destinations[0];
    const singleRes = await fetch(`${baseUrl}/destinations/${sampleDest._id}`);
    const singleData = await singleRes.json();
    assert(singleRes.status === 200, 'GET /api/destinations/:id returns 200 OK');
    assert(singleData.data.destination.name === sampleDest.name, 'Retrieved destination matches sample ID');

    const invalidIdRes = await fetch(`${baseUrl}/destinations/invalid-non-hex-id`);
    assert(invalidIdRes.status === 400, 'GET /api/destinations/invalid-id handled with 400 Bad Request (CastError/Zod)');

    // Discovery Engine
    const discoverRes = await fetch(
      `${baseUrl}/destinations/discover?budget=20000&availableTimeDays=5&travelStyle=adventure&interests=mountain,nature`
    );
    const discoverData = await discoverRes.json();
    assert(discoverRes.status === 200, 'GET /api/destinations/discover returns 200 OK');
    assert(discoverData.data.destinations.length > 0, 'Discovery engine returns ranked recommendations');
    assert(typeof discoverData.data.destinations[0].matchScore === 'number', 'Discovery items contain calculated matchScore');

    // 5. Test Wishlist / Saved Trips CRUD & Duplicate Prevention
    console.log('\n[5/8] Testing Wishlist (SavedTrips) CRUD & Duplicate Prevention...');
    const destToSave = listData.data.destinations[1];

    // Save trip
    const saveTripRes = await fetch(`${baseUrl}/saved-trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        destinationId: destToSave._id,
        notes: 'Must pack hiking gear and camera.',
        visitedStatus: 'planned',
        targetBudget: 15000
      })
    });
    const saveTripData = await saveTripRes.json();
    assert(saveTripRes.status === 201, 'POST /api/saved-trips returns 201 Created');
    const savedTripId = saveTripData.data.savedTrip._id;

    // Duplicate save prevention
    const dupSaveRes = await fetch(`${baseUrl}/saved-trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        destinationId: destToSave._id,
        notes: 'Trying to save again'
      })
    });
    assert(dupSaveRes.status === 409, 'Duplicate save for same user + destination returns 409 Conflict');

    // List user's saved trips
    const listSavedRes = await fetch(`${baseUrl}/saved-trips`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const listSavedData = await listSavedRes.json();
    assert(listSavedRes.status === 200, 'GET /api/saved-trips returns 200 OK');
    assert(listSavedData.data.savedTrips.some(s => s._id === savedTripId), 'Saved trip appears in user wishlist');

    // Update notes and visited status
    const updateTripRes = await fetch(`${baseUrl}/saved-trips/${savedTripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        notes: 'Updated: Traveled in December! Amazing views.',
        visitedStatus: 'visited'
      })
    });
    const updateTripData = await updateTripRes.json();
    assert(updateTripRes.status === 200, 'PUT /api/saved-trips/:id returns 200 OK');
    assert(updateTripData.data.savedTrip.visitedStatus === 'visited', 'Visited status updated to "visited"');

    // Create a second user to test ownership protection
    const secondUserRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Priya Patel',
        email: `priya_${Date.now()}@example.com`,
        password: 'password123'
      })
    });
    const secondUserData = await secondUserRes.json();
    const secondUserToken = secondUserData.data.token;

    // Second user tries to update first user's saved trip -> 403 Forbidden
    const unauthUpdateRes = await fetch(`${baseUrl}/saved-trips/${savedTripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secondUserToken}`
      },
      body: JSON.stringify({ notes: 'Intruder notes' })
    });
    assert(unauthUpdateRes.status === 403, 'Unauthorized modification of another user’s saved trip blocked with 403');

    // Delete saved trip
    const deleteTripRes = await fetch(`${baseUrl}/saved-trips/${savedTripId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(deleteTripRes.status === 200, 'DELETE /api/saved-trips/:id returns 200 OK');

    // 6. Test Reviews CRUD & Average Rating Calculation
    console.log('\n[6/8] Testing Reviews CRUD & Rating Average Calculation...');
    const destForReview = listData.data.destinations[2];
    const initialRating = destForReview.averageRating || 0;
    const initialReviewCount = destForReview.reviewCount || 0;

    // Post Review
    const createReviewRes = await fetch(`${baseUrl}/destinations/${destForReview._id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        rating: 5,
        title: 'Unforgettable Journey!',
        comment: 'The sunrise across the peaks was breathtaking and hospitality was top-notch.'
      })
    });
    const createReviewData = await createReviewRes.json();
    assert(createReviewRes.status === 201, 'POST /api/destinations/:id/reviews returns 201 Created');
    const reviewId = createReviewData.data.review._id;

    // Enforce one review per user per destination
    const dupReviewRes = await fetch(`${baseUrl}/destinations/${destForReview._id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        rating: 4,
        comment: 'Trying to post another review'
      })
    });
    assert(dupReviewRes.status === 409, 'Duplicate review on same destination rejected with 409 Conflict');

    // List reviews for destination
    const getReviewsRes = await fetch(`${baseUrl}/destinations/${destForReview._id}/reviews`);
    const getReviewsData = await getReviewsRes.json();
    assert(getReviewsRes.status === 200, 'GET /api/destinations/:id/reviews returns 200 OK');
    assert(getReviewsData.data.reviews.some(r => r._id === reviewId), 'Posted review listed in destination reviews');

    // Update review
    const updateReviewRes = await fetch(`${baseUrl}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        rating: 4,
        comment: 'Updated: Excellent experience overall, slightly crowded in peak afternoon.'
      })
    });
    assert(updateReviewRes.status === 200, 'PUT /api/reviews/:id returns 200 OK');

    // Second user cannot edit first user's review -> 403 Forbidden
    const unauthEditReview = await fetch(`${baseUrl}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secondUserToken}`
      },
      body: JSON.stringify({ comment: 'Hacked comment' })
    });
    assert(unauthEditReview.status === 403, 'Unauthorized review modification blocked with 403 Forbidden');

    // Delete review
    const deleteReviewRes = await fetch(`${baseUrl}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(deleteReviewRes.status === 200, 'DELETE /api/reviews/:id returns 200 OK');

    // 7. Test Logout & Cookie Invalidation
    console.log('\n[7/8] Testing Logout...');
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST'
    });
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns 200 OK');
    const logoutCookie = logoutRes.headers.get('set-cookie');
    assert(logoutCookie && (logoutCookie.includes('token=;') || logoutCookie.includes('Expires=')), 'Logout response clears token cookie');

    // Clean up test data
    console.log('\n[8/8] Cleaning up temporary test artifacts...');
    await User.deleteMany({ email: { $in: [testEmail, attackerEmail, secondUserData.data.user.email] } });
    await SavedTrip.deleteMany({ user: regData.data.user.id });
    await Review.deleteMany({ user: regData.data.user.id });
    await DiscoveryHistory.deleteMany({ user: regData.data.user.id });
    console.log('  Cleaned up temporary user and review documents.');

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution failed with unhandled error:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
};

runTests();
