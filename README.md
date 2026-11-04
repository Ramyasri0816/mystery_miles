# MysteryMiles ✈️🇮🇳

**MysteryMiles** is a full-stack, personalized travel discovery web application designed to eliminate travel planning fatigue. Instead of endless destination scrolling, travelers enter their realistic budget, available duration, starting location, travel style, and interests to discover personalized, high-affinity destinations matched with daily cost estimates, curated highlights, transparent matching reasons, and match scoring.

The platform includes a database of 27 curated **Indian destinations**, complete user authentication with secure HTTP-only cookies and JWTs, personal wishlist/saved trips management, destination community reviews with automatic rating recalculation, and the signature **Mystery Destination Matching Engine**.

---

## 🎨 Design Direction & Frontend Aesthetics
- **Theme:** Modern, colorful, interactive travel startup.
- **Palette:** Warm cream backgrounds (`#FAF8F5` / `#FDFBF7`), vibrant coral and sunset orange accents (`#FF5A5F` / `#FF7A00`), turquoise and sky blue secondary colors (`#00A896` / `#0284C7`).
- **Components:** Rounded cards (`border-radius: 16px/24px`), authentic travel photography, smooth transitions, micro-interactions, responsive navigation, friendly typography, and accessible form controls.

---

## 🖥️ Complete Application Pages

### 1. Home Page (`/`)
- Exciting travel hero section with prominent **"🎲 Spin Mystery Destination"** and **"Explore All Destinations"** call-to-actions.
- Curated category chips for 8 popular themes (Hill Station, Beach, Heritage, Spiritual, Wildlife, Adventure, Nature, Desert).
- Live featured Indian destinations grid directly loaded from MongoDB.
- **"How the Matching Engine Works"** 3-step explainer illustrating the 4-factor multi-attribute scoring model.
- Responsive navigation header with live real-time API health status badge.

### 2. Register & Login (`/register`, `/login`)
- Attractive authentication cards with warm cream backdrops and coral gradient buttons.
- Full form validation with clear real-time error banners and success messages.
- Password visibility show/hide toggle.
- Secure token storage via HTTP-only cookies and Bearer tokens in localStorage.

### 3. Explore Directory (`/explore`)
- Real-time search by destination name, city, state, or keywords.
- Category filters (Hill Station, Beach, Heritage, Spiritual, Wildlife, Adventure, etc.).
- State dropdown filter across all Indian states and union territories.
- Budget tier filter (`budget`, `mid-range`, `luxury`).
- Sort by rating, daily cost (low to high, high to low), and destination name.
- Interactive destination cards with 1-click wishlist toggle heart icon.
- Numbered pagination controls.

### 4. Destination Details (`/destinations/:id`)
- High-resolution hero image with gallery thumbnail selector.
- Detailed destination overview, cultural context, and key highlights.
- Key trip metrics: State, category, estimated daily budget in INR/USD, suggested stay duration in days.
- 1-click **"Save to Wishlist"** heart button with instant visual feedback.
- Verified community reviews list with star ratings, titles, comments, and reviewer avatars.
- Interactive review submission form with 1–5 star rating picker.

### 5. Signature Mystery Spin (`/spin`)
- Interactive preference form:
  - Budget in INR (e.g. ₹15,000)
  - Duration with **Days / Hours** toggle (e.g. 4 days or 72 hours)
  - Starting location in India with autocomplete for 20+ major hubs (Delhi, Mumbai, Bengaluru, etc.)
  - Travel style selector (Solo, Couple, Family, Backpacker, Luxury, Adventure, Cultural)
  - Multi-select interest chips (Nature, Mountain, Beach, Culture, Food, Wildlife, Spiritual, History, etc.)
- **Animated Mystery Reveal Suspense:**
  - Spinning compass animation with cycling algorithm diagnostic status updates.
- **Revealed Mystery Destination Result Card:**
  - Glowing **"🎉 Mystery Destination Unlocked"** badge
  - Destination name, state, category, and photography
  - Prominent **Match Score Badge** (e.g. 96% Match)
  - **4-Factor Weighted Score Breakdown:**
    - 40% Interests Match
    - 30% Budget Compatibility
    - 20% Duration Feasibility
    - 10% Travel Style Synergy
  - **Transparent Matching Reasons:** Explainable bulleted points detailing why the destination was selected.
  - **Financial Breakdown:** Total estimated cost, daily cost, and remaining budget savings buffer.
  - **Actions:** 🎲 Spin Again, ❤️ 1-Click Save to Wishlist, and View Full Itinerary Guide.
  - **Alternative Top Candidates:** 3 high-compatibility runner-up destinations.
  - **Diagnostic Hints:** Actionable adjustment advice if user enters impossible criteria (e.g. ₹500 for 10 days).

### 6. My Wishlist (`/wishlist`, Protected)
- Complete list of user's saved destinations loaded from MongoDB.
- Filter tabs: **All**, **Planned**, and **Visited**.
- Visited status toggle (mark places as visited when completed).
- In-place private itinerary notes editor (e.g. "Stay near Calangute, rent a scooter").
- Remove destination action with confirmation dialog.
- Direct links to destination itinerary guides.

### 7. My Profile (`/profile`, Protected)
- **User Overview Card:** Traveler avatar, name, email, role badge ("Traveler" or "Admin"), and biography.
- **Travel Statistics Grid:**
  - 🎲 Total Mystery Spins completed
  - 📌 Destinations saved in Wishlist
  - 🎒 Places visited
  - 🎯 Best algorithm match score achieved
- **Travel Preferences Editor:** Customize and save default starting hub, travel style, budget tier, duration, and favorite interests.
- **Discovery History Section:** Complete audit trail of past mystery spins with timestamps, match scores, search criteria used, destination thumbnails, and direct links.
- **Edit Profile:** Update display name, traveler biography, and select from custom avatars.

---

## 🚀 Technology Stack

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database & ODM:** [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com/)
- **Validation:** [Zod](https://zod.dev/) schema validation for queries, parameters, and payloads
- **Authentication & Security:** JSON Web Tokens (`jsonwebtoken`) + Password Hashing (`bcryptjs`) + `cookie-parser` for HTTP-only cookies
- **CORS:** Configured for cross-origin frontend communication with credentials

### Frontend
- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing:** [React Router v6](https://reactrouter.com/) (Public & Protected Routes)
- **State & Context:** React Context API (`AuthContext`)
- **HTTP Client:** [Axios](https://axios-http.com/) with request/response interceptors
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Custom CSS Design System with CSS variables, smooth transitions, and responsive grid layouts

---

## 📁 Project Architecture & Directory Structure

```
Mystery_miles/
├── package.json                                # Monorepo development scripts
├── README.md                                   # Complete project documentation
│
├── backend/
│   ├── .env                                    # Local backend environment configuration
│   ├── .env.example                            # Template for backend environment variables
│   ├── package.json                            # Express dependencies & scripts
│   ├── tests/
│   │   ├── backend.test.js                     # 50-step REST API integration test suite
│   │   └── matchingEngine.test.js              # 41-step matching engine unit & integration tests
│   └── src/
│       ├── app.js                              # Express app configuration & middleware
│       ├── server.js                           # Server bootstrap & listener
│       ├── config/
│       │   ├── db.js                           # Mongoose connection & monitoring
│       │   └── env.js                          # Zod-validated environment config
│       ├── controllers/
│       │   ├── auth.controller.js              # Register, login, logout, profile & preferences
│       │   ├── destination.controller.js       # Search, filter, pagination, sorting & details
│       │   ├── discovery.controller.js         # Mystery spin & discovery history controller
│       │   ├── review.controller.js            # Review CRUD & rating recalculation
│       │   └── savedTrip.controller.js         # Wishlist CRUD with duplicate prevention
│       ├── middleware/
│       │   ├── auth.middleware.js              # Cookie / Bearer token authentication & RBAC
│       │   ├── error.middleware.js             # Centralized error handler (CastError, 11000, Zod)
│       │   └── validate.middleware.js          # Generic Zod request validator
│       ├── models/
│       │   ├── Destination.model.js            # Destination schema, search indexes, hooks
│       │   ├── DiscoveryHistory.model.js       # User travel discovery search history
│       │   ├── Review.model.js                 # Review schema, compound unique index, rating aggregate
│       │   ├── SavedTrip.model.js              # Wishlist schema with unique user + destination
│       │   └── User.model.js                   # User schema with pre-save bcrypt hashing
│       ├── routes/
│       │   ├── auth.routes.js                  # /api/auth endpoints
│       │   ├── destination.routes.js           # /api/destinations endpoints
│       │   ├── discovery.routes.js            # /api/discovery endpoints
│       │   ├── health.routes.js                # /api/health endpoint
│       │   ├── review.routes.js                # /api/reviews endpoints
│       │   └── savedTrip.routes.js             # /api/saved-trips endpoints
│       ├── scripts/
│       │   └── seedDestinations.js             # Seeds 27 realistic Indian destinations
│       └── services/
│           └── matchingEngine.service.js       # 4-factor matching algorithm engine
│
└── frontend/
    ├── .env                                    # Frontend environment configuration
    ├── package.json                            # React & Vite dependencies & scripts
    ├── vite.config.js                          # Vite build configuration
    └── src/
        ├── App.jsx                             # Main layout with Navbar, Routes, and Footer
        ├── main.jsx                            # React root bootstrap
        ├── components/
        │   ├── common/
        │   │   ├── Footer.jsx                  # Rich application footer
        │   │   ├── Navbar.jsx                  # Header with health badge & mobile drawer
        │   │   └── ProtectedRoute.jsx          # Route guard for authenticated pages
        │   └── discovery/
        │       ├── DestinationCard.jsx         # Card with match score, fallback image & wishlist toggle
        │       └── DiscoveryForm.jsx           # Preference form with Indian hubs & days/hours toggle
        ├── context/
        │   └── AuthContext.jsx                 # User state, login, register, profile & preferences
        ├── hooks/
        │   └── useAuth.js                      # Custom auth hook
        ├── pages/
        │   ├── DestinationDetailPage.jsx       # Gallery, highlights, budget metrics, reviews
        │   ├── ExplorePage.jsx                 # Live search, filters, state dropdown, pagination
        │   ├── HomePage.jsx                    # Hero, categories, featured destinations, explainer
        │   ├── LoginPage.jsx                   # Sign-in form with validation
        │   ├── MysterySpinPage.jsx             # Animated mystery spin reveal & score breakdown
        │   ├── NotFoundPage.jsx                # Friendly 404 page
        │   ├── ProfilePage.jsx                 # Overview, stats, preferences, spin history & editor
        │   ├── RegisterPage.jsx                # Sign-up form with validation
        │   └── WishlistPage.jsx                # Wishlist items, notes editor, visited toggle
        ├── routes/
        │   └── AppRoutes.jsx                   # Central route mapping
        ├── services/
        │   ├── api.js                          # Axios instance with interceptors
        │   ├── authService.js                  # Authentication & user profile API calls
        │   ├── discoveryService.js             # Mystery spin & history API calls
        │   ├── reviewService.js                # Community reviews API calls
        │   ├── savedTripService.js             # Wishlist CRUD API calls
        │   └── travelService.js                # Destinations & health check API calls
        └── styles/
            └── index.css                       # Complete CSS Design System
```

---

## ⚙️ How to Run the Applications

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` or a MongoDB Atlas connection string in `backend/.env`.

### 1. Start the Backend API
```bash
cd backend
npm install
npm run seed       # Seeds the 27 authentic Indian destinations into MongoDB
npm run dev        # Starts Express server on http://localhost:5000
```

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server on http://localhost:5173
```
Open **`http://localhost:5173`** in your browser.

### 3. Run Automated Tests
```bash
# Backend REST API Integration Tests (50 assertions)
cd backend
npm test

# Matching Engine Unit & Integration Tests (41 assertions)
cd backend
npm run test:engine

# Frontend Production Build Test
cd frontend
npm run build
```

---

## 🎯 The Mystery Destination Matching Engine Algorithm

The algorithm evaluates actual stored MongoDB records using a 3-phase deterministic evaluation:

### Phase 1: Strict Boundary Filtering (Hard Constraints)
Destinations must satisfy:
1. **Budget Feasibility:** Total estimated trip cost $\le$ User's declared budget (with a 10% flexible buffer).
2. **Duration Feasibility:** User duration $\ge$ destination minimum stay duration (`minDurationDays`).
3. **Starting Location Transit:** Hub compatibility check against Indian zone connectivity.

### Phase 2: Multi-Factor Scoring (0 to 100)
1. **Interest Synergy ($S_{\text{interests}}$) — 40% Weight:** Jaccard overlap between user selected interests and destination interest tags.
2. **Budget Compatibility ($S_{\text{budget}}$) — 30% Weight:** Evaluates budget utilization ratio. Ideal zone is $65\% - 90\%$, maintaining a safety savings buffer.
3. **Duration Compatibility ($S_{\text{duration}}$) — 20% Weight:** Evaluates how comfortably the user duration matches the recommended duration span `[minDurationDays, maxDurationDays]`.
4. **Travel Style Synergy ($S_{\text{style}}$) — 10% Weight:** Direct or complementary match between user style (e.g. `solo`, `couple`, `family`, `backpacker`, `luxury`) and destination styles.

$$\text{FinalScore} = (0.40 \times S_{\text{interests}}) + (0.30 \times S_{\text{budget}}) + (0.20 \times S_{\text{duration}}) + (0.10 \times S_{\text{style}})$$

### Phase 3: Selection & Repeat Avoidance
- Eligible destinations are sorted descending by $\text{FinalScore}$.
- The top-ranking candidates within 5% of the highest score form the **Top Tier Pool**.
- Destinations discovered by the user in the past 30 days are bypassed to ensure fresh discoveries.
- A destination is selected from the top tier, recorded in the `DiscoveryHistory` collection, and returned with explainable matching reasons and alternative runner-ups.
