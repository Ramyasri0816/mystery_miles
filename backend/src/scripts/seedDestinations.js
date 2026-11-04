import mongoose from 'mongoose';
import env from '../config/env.js';
import Destination from '../models/Destination.model.js';
import logger from '../utils/logger.js';

export const INDIAN_DESTINATIONS = [
  {
    name: 'Ladakh (Leh & Pangong Tso)',
    tagline: 'High-altitude cold desert, ancient gompas, and turquoise alpine lakes',
    description: 'Perched in the trans-Himalayan realm, Ladakh is renowned for rugged barren mountains, Tibetan Buddhist monasteries perched on cliffs, the world’s highest motorable passes like Khardung La, and the ethereal color-changing waters of Pangong Tso and Nubra Valley.',
    category: 'Adventure',
    state: 'Ladakh',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 3800,
    minDurationDays: 6,
    maxDurationDays: 12,
    travelStyles: ['adventure', 'solo', 'couple'],
    bestSeasons: ['Summer', 'Autumn'],
    interests: ['mountain', 'adventure', 'culture', 'nature', 'spiritual'],
    highlights: ['Pangong Tso camping under starry night skies', 'Magnetic Hill and Sangam confluence', 'Thiksey & Hemis Gompa morning prayers', 'Camel safari through Hunder sand dunes in Nubra'],
    imageUrls: [
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.9,
    reviewCount: 38
  },
  {
    name: 'Varanasi (Kashi & The Sacred Ghats)',
    tagline: 'The timeless spiritual heart of India along the sacred River Ganges',
    description: 'One of the world’s oldest continuously inhabited cities, Varanasi draws travelers into mystical riverside ghats, echoing temple bells, intoxicating incense, boat rides at sunrise, and the grand evening Ganga Aarti at Dashashwamedh Ghat.',
    category: 'Spiritual',
    state: 'Uttar Pradesh',
    country: 'India',
    budgetTier: 'budget',
    estimatedDailyCostINR: 1600,
    minDurationDays: 2,
    maxDurationDays: 5,
    travelStyles: ['cultural', 'solo', 'backpacker'],
    bestSeasons: ['Winter', 'Autumn', 'Spring'],
    interests: ['spiritual', 'culture', 'history', 'food'],
    highlights: ['Subah-e-Banaras sunrise boat ride on the Ganges', 'Grand evening Ganga Aarti ceremony at Dashashwamedh Ghat', 'Kashi Vishwanath Temple corridor exploration', 'Sampling authentic Banarasi chaat, lassi, and paan'],
    imageUrls: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 45
  },
  {
    name: 'Goa (Beaches, Portuguese Quarters & Coastline)',
    tagline: 'Sun-drenched golden beaches, vibrant susegad culture, and coastal seafood',
    description: 'India’s premier coastal sanctuary combines Portuguese colonial churches in Old Goa, palm-fringed shores from Palolem to Arambol, fragrant spice plantations, sunset beach shacks, and watersports.',
    category: 'Beach',
    state: 'Goa',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 3200,
    minDurationDays: 3,
    maxDurationDays: 8,
    travelStyles: ['couple', 'solo', 'family', 'relaxation', 'adventure'],
    bestSeasons: ['Winter', 'Autumn'],
    interests: ['beach', 'relaxation', 'food', 'nightlife', 'history'],
    highlights: ['Sunset at Palolem and Morjim beaches', 'Walking through Latin Quarter heritage houses in Fontainhas', 'Basilica of Bom Jesus and Se Cathedral in Old Goa', 'Dudhsagar Waterfalls trek through Bhagwan Mahaveer Sanctuary'],
    imageUrls: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.7,
    reviewCount: 62
  },
  {
    name: 'Alleppey (Alappuzha Backwaters & Houseboats)',
    tagline: 'Tranquil emerald canals, swaying coconut groves, and traditional houseboats',
    description: 'Dubbed the Venice of the East, Alleppey is famous for its intricate maze of tranquil canals, serene lagoons, and overnight cruises aboard traditional thatched kettuvallam houseboats serving authentic Malabar curry.',
    category: 'Nature',
    state: 'Kerala',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 3400,
    minDurationDays: 2,
    maxDurationDays: 5,
    travelStyles: ['couple', 'relaxation', 'family', 'luxury'],
    bestSeasons: ['Winter', 'Autumn', 'Monsoon'],
    interests: ['nature', 'relaxation', 'food', 'culture'],
    highlights: ['Overnight traditional kettuvallam luxury houseboat stay', 'Village kayak trails through narrow backwater lagoons', 'Watching snake boat races during harvest festivities', 'Ayurvedic wellness rejuvenation therapies'],
    imageUrls: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.9,
    reviewCount: 34
  },
  {
    name: 'Jaipur (The Pink City & Rajput Palaces)',
    tagline: 'Opulent royal palaces, hilltop desert forts, and vibrant bazaars',
    description: 'The capital of Rajasthan is a treasure trove of majestic Rajput architecture, from the terracotta-pink facade of Hawa Mahal and the hilltop ramparts of Amer Fort to the astronomical marvel of Jantar Mantar.',
    category: 'Heritage',
    state: 'Rajasthan',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 2800,
    minDurationDays: 3,
    maxDurationDays: 6,
    travelStyles: ['cultural', 'family', 'couple', 'luxury'],
    bestSeasons: ['Winter', 'Autumn', 'Spring'],
    interests: ['history', 'culture', 'architecture', 'food'],
    highlights: ['Amer Fort light and sound spectacle overlooking Maota Lake', 'Hawa Mahal honeycomb palace photo point', 'City Palace courtyards and royal museum artifacts', 'Johari and Bapu Bazzar gemstone and textile shopping'],
    imageUrls: [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 51
  },
  {
    name: 'Rishikesh & Haridwar (Ganga & Himalayas)',
    tagline: 'Yoga capital of the world, white-water river rapids, and Himalayan foothills',
    description: 'Nestled where the sacred Ganges tumbles from the lower Himalayas, Rishikesh is an adventure and spiritual paradise featuring river rafting, ashram retreats, bungee jumping, and cliff jumping alongside serene evening aartis.',
    category: 'Adventure',
    state: 'Uttarakhand',
    country: 'India',
    budgetTier: 'budget',
    estimatedDailyCostINR: 1800,
    minDurationDays: 3,
    maxDurationDays: 7,
    travelStyles: ['adventure', 'solo', 'backpacker', 'spiritual'],
    bestSeasons: ['Spring', 'Autumn', 'Winter'],
    interests: ['adventure', 'spiritual', 'nature', 'mountain'],
    highlights: ['White water rafting through Grade IV rapids on the Ganges', 'Ganga Aarti at Triveni Ghat and Parmarth Niketan', 'The Beatles Ashram (Chaurasi Kutia) murals', 'Cliff camping and stargazing in Shivpuri'],
    imageUrls: [
      'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 42
  },
  {
    name: 'Hampi (Boulders & Vijayanagara Ruins)',
    tagline: 'Surreal boulder-strewn landscapes and ancient empire UNESCO ruins',
    description: 'A UNESCO World Heritage marvel, Hampi is an open-air museum set amid massive granite boulders along the Tungabhadra River, displaying the grand ruins, stone chariots, and musical pillars of the Vijayanagara Empire.',
    category: 'Heritage',
    state: 'Karnataka',
    country: 'India',
    budgetTier: 'budget',
    estimatedDailyCostINR: 1500,
    minDurationDays: 2,
    maxDurationDays: 5,
    travelStyles: ['backpacker', 'solo', 'cultural', 'adventure'],
    bestSeasons: ['Winter', 'Autumn'],
    interests: ['history', 'architecture', 'culture', 'nature'],
    highlights: ['Vijaya Vittala Temple and the iconic Stone Chariot', 'Sunset view from atop Matanga Hill', 'Coracle boat ride across the Tungabhadra River', 'Bouldering and cafe hopping across the river in Hippie Island'],
    imageUrls: [
      'https://images.unsplash.com/photo-1600100397608-f010e422a578?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.9,
    reviewCount: 29
  },
  {
    name: 'Udaipur (The City of Lakes)',
    tagline: 'Palaces floating on shimmering lakes and romantic sunset vistas',
    description: 'Often called the most romantic city in India, Udaipur centers around serene Lake Pichola, where the white marble Lake Palace appears to float on the waters, flanked by Aravali hills, vibrant royal mansions, and historic ghats.',
    category: 'Heritage',
    state: 'Rajasthan',
    country: 'India',
    budgetTier: 'luxury',
    estimatedDailyCostINR: 5200,
    minDurationDays: 3,
    maxDurationDays: 6,
    travelStyles: ['couple', 'luxury', 'cultural', 'family'],
    bestSeasons: ['Winter', 'Autumn', 'Spring'],
    interests: ['culture', 'history', 'architecture', 'relaxation'],
    highlights: ['Sunset boat cruise around Lake Pichola and Jagmandir', 'City Palace museum tour overlooking the lake', 'Dharohar folk dance show at Bagore Ki Haveli', 'Rooftop dinner overlooking illuminated lakeside palaces'],
    imageUrls: [
      'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.9,
    reviewCount: 47
  },
  {
    name: 'Manali & Solang Valley',
    tagline: 'Alpine pine forests, snow-clad mountain passes, and Himalayan thrill',
    description: 'Surrounded by towering snow-capped peaks of the Pir Panjal and Dhauladhar ranges, Manali is a gateway to high mountain adventures, apple orchards, quaint cafes in Old Manali, and the breathtaking high passes of Rohtang and Atal Tunnel.',
    category: 'Hill Station',
    state: 'Himachal Pradesh',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 2600,
    minDurationDays: 4,
    maxDurationDays: 8,
    travelStyles: ['adventure', 'couple', 'family', 'solo'],
    bestSeasons: ['Summer', 'Winter', 'Spring'],
    interests: ['mountain', 'adventure', 'nature', 'relaxation'],
    highlights: ['Snow adventures and paragliding in Solang Valley', 'Scenic drive through Atal Tunnel to Sissu waterfall', 'Old Manali wooden cafes and live music sessions', 'Jogini Waterfall trek starting from Vashisht hot springs'],
    imageUrls: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.7,
    reviewCount: 58
  },
  {
    name: 'Munnar (Tea Gardens & Western Ghats)',
    tagline: 'Rolling green tea plantations, misty valleys, and cool mountain air',
    description: 'At an altitude of 1,600 meters in the Western Ghats, Munnar features undulating emerald tea plantations, rare Neelakurinji blossoms, exotic wildlife in Eravikulam National Park, and spectacular waterfalls.',
    category: 'Hill Station',
    state: 'Kerala',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 2500,
    minDurationDays: 3,
    maxDurationDays: 6,
    travelStyles: ['couple', 'family', 'relaxation', 'nature'],
    bestSeasons: ['Winter', 'Autumn', 'Monsoon'],
    interests: ['nature', 'relaxation', 'mountain', 'wildlife'],
    highlights: ['Endless carpet of tea estate trails at Kolukkumalai', 'Spotting endangered Nilgiri Tahr at Eravikulam National Park', 'Mattupetty Dam boat rides and Echo Point', 'Scenic sunrise viewpoint above the cloud bed at Top Station'],
    imageUrls: [
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 36
  },
  {
    name: 'Shillong & Cherrapunji (Abode of Clouds)',
    tagline: 'Living root bridges, roaring waterfalls, and misty pine valleys',
    description: 'Located in Meghalaya, the wettest region on earth, Shillong combines vibrant rock music culture and Scottish-style landscapes with Cherrapunji’s ancient centuries-old bio-engineered living root bridges and limestone caves.',
    category: 'Nature',
    state: 'Meghalaya',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 2900,
    minDurationDays: 4,
    maxDurationDays: 8,
    travelStyles: ['adventure', 'nature', 'solo', 'couple'],
    bestSeasons: ['Autumn', 'Winter', 'Spring'],
    interests: ['nature', 'adventure', 'culture', 'mountain'],
    highlights: ['Double Decker Living Root Bridge trek in Nongriat', 'Crystal clear waters of Dawki Umngot river boating', 'Nohkalikai Falls, India’s tallest plunge waterfall', 'Mawsmai and Arwah ancient limestone cave expeditions'],
    imageUrls: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.9,
    reviewCount: 28
  },
  {
    name: 'Havelock Island (Swaraj Dweep & Andaman)',
    tagline: 'Pristine turquoise lagoons, white coral sands, and world-class scuba reefs',
    description: 'The crown jewel of the Andaman archipelago, Havelock features Radhanagar Beach (rated among Asia’s finest), crystal-clear coral reefs rich in marine biodiversity, and thrilling night bioluminescent kayaking.',
    category: 'Island',
    state: 'Andaman & Nicobar',
    country: 'India',
    budgetTier: 'luxury',
    estimatedDailyCostINR: 6500,
    minDurationDays: 4,
    maxDurationDays: 8,
    travelStyles: ['couple', 'adventure', 'luxury', 'relaxation'],
    bestSeasons: ['Winter', 'Spring', 'Autumn'],
    interests: ['beach', 'adventure', 'wildlife', 'relaxation'],
    highlights: ['Sunset stroll along Radhanagar Beach white sands', 'Scuba diving with sea turtles and manta rays at Elephant Beach', 'Night kayaking among glowing bioluminescent phytoplankton', 'Trekking through tropical rainforest to secret coves'],
    imageUrls: [
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.9,
    reviewCount: 31
  },
  {
    name: 'Darjeeling (Queen of the Hills & Toy Train)',
    tagline: 'Aromatic tea estates, Kanchenjunga sunrise views, and colonial heritage',
    description: 'Perched in the Lesser Himalayas of West Bengal, Darjeeling is famed for world-class black tea, the historic UNESCO Himalayan Toy Train, and sweeping panoramic views of the mighty Mount Kanchenjunga from Tiger Hill.',
    category: 'Hill Station',
    state: 'West Bengal',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 2400,
    minDurationDays: 3,
    maxDurationDays: 6,
    travelStyles: ['family', 'couple', 'cultural', 'relaxation'],
    bestSeasons: ['Spring', 'Autumn', 'Winter'],
    interests: ['mountain', 'nature', 'culture', 'history'],
    highlights: ['Golden sunrise over Mount Kanchenjunga from Tiger Hill', 'Riding the steam-driven Darjeeling Himalayan Railway Toy Train', 'Walking through Happy Valley and Makaibari tea estates', 'Visiting Himalayan Mountaineering Institute and Snow Leopard breeding center'],
    imageUrls: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.7,
    reviewCount: 33
  },
  {
    name: 'Agra (Taj Mahal & Mughal Grandeur)',
    tagline: 'The timeless monument of eternal love and majestic red sandstone fortresses',
    description: 'Home to the immortal Taj Mahal, one of the Seven Wonders of the World, Agra also features the imposing Agra Fort and the abandoned red sandstone ghost city of Fatehpur Sikri.',
    category: 'Heritage',
    state: 'Uttar Pradesh',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 2300,
    minDurationDays: 2,
    maxDurationDays: 4,
    travelStyles: ['cultural', 'family', 'couple'],
    bestSeasons: ['Winter', 'Autumn', 'Spring'],
    interests: ['history', 'architecture', 'culture', 'food'],
    highlights: ['Watching the white marble Taj Mahal change shades at sunrise', 'Exploring the Jahangiri Mahal and Sheesh Mahal in Agra Fort', 'Day excursion to Fatehpur Sikri and Buland Darwaza', 'Tasting world-famous Agra petha and Mughlai delicacies'],
    imageUrls: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 72
  },
  {
    name: 'Gokarna (Sacred Shores & Cliff Beaches)',
    tagline: 'Quiet palm-lined cliff beaches, temple town vibes, and bohemian trails',
    description: 'An idyllic alternative to commercial coastal hubs, Gokarna combines ancient Mahabaleshwar Shiva shrines with secluded pristine beaches like Om Beach, Kudle, Half Moon, and Paradise Beach linked by coastal hiking trails.',
    category: 'Beach',
    state: 'Karnataka',
    country: 'India',
    budgetTier: 'budget',
    estimatedDailyCostINR: 1400,
    minDurationDays: 3,
    maxDurationDays: 6,
    travelStyles: ['backpacker', 'solo', 'relaxation', 'adventure'],
    bestSeasons: ['Winter', 'Autumn', 'Spring'],
    interests: ['beach', 'relaxation', 'spiritual', 'nature'],
    highlights: ['Five-beach cliff trail hike from Kudle to Paradise Beach', 'Sunset yoga and fresh seafood on Om Beach', 'Visiting the 4th-century Mahabaleshwar Temple Atmalinga', 'Stargazing around quiet beach campfires'],
    imageUrls: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 30
  },
  {
    name: 'Coorg (Kodagu Coffee Plantations & Waterfalls)',
    tagline: 'Aromatic Arabica plantations, misty river gorges, and Kodava hospitality',
    description: 'Referred to as the Scotland of India, Coorg is a verdant paradise on the eastern slopes of the Western Ghats filled with aromatic coffee and spice plantations, Abbey Falls, and the Tibetan Buddhist Golden Temple in Bylakuppe.',
    category: 'Hill Station',
    state: 'Karnataka',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 2700,
    minDurationDays: 3,
    maxDurationDays: 5,
    travelStyles: ['couple', 'family', 'relaxation', 'nature'],
    bestSeasons: ['Winter', 'Autumn', 'Monsoon'],
    interests: ['nature', 'relaxation', 'culture', 'food'],
    highlights: ['Guided walk through fragrant coffee, pepper, and cardamom plantations', 'Namdroling Tibetan Monastery (Golden Temple) in Bylakuppe', 'Trekking to Tadiandamol, the highest peak in Coorg', 'Bathing elephants at Dubare Elephant Camp'],
    imageUrls: [
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 35
  },
  {
    name: 'Ooty & Nilgiri Hills',
    tagline: 'Colonial heritage cottages, botanical gardens, and Nilgiri Mountain Railway',
    description: 'Nestled deep in Tamil Nadu’s Nilgiri Hills, Ooty charms visitors with cool mountain breezes, sprawling tea gardens, Doddabetta Peak, and the charming blue wooden coaches of the UNESCO-inscribed Nilgiri Mountain Railway.',
    category: 'Hill Station',
    state: 'Tamil Nadu',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 2300,
    minDurationDays: 3,
    maxDurationDays: 5,
    travelStyles: ['family', 'couple', 'relaxation'],
    bestSeasons: ['Summer', 'Winter', 'Spring'],
    interests: ['mountain', 'nature', 'relaxation', 'history'],
    highlights: ['Nilgiri Mountain Railway toy train ride through tunnels and viaducts', 'Panoramic valley views from Doddabetta Peak', 'Boating in Pykara Lake and visiting Pykara waterfalls', 'Strolling through Government Botanical Gardens & Rose Garden'],
    imageUrls: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.7,
    reviewCount: 39
  },
  {
    name: 'Jaisalmer (The Golden City & Thar Desert)',
    tagline: 'Living golden sandstone fort, camel desert safaris, and folk melodies',
    description: 'Rising from the golden sands of the Thar Desert like a mirage, Jaisalmer features the world’s only living fort where thousands reside inside ancient ramparts, intricately carved yellow sandstone havelis, and desert dune glamping.',
    category: 'Desert',
    state: 'Rajasthan',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 3100,
    minDurationDays: 3,
    maxDurationDays: 6,
    travelStyles: ['cultural', 'adventure', 'couple', 'solo'],
    bestSeasons: ['Winter', 'Autumn'],
    interests: ['culture', 'history', 'adventure', 'architecture'],
    highlights: ['Walking inside the living Jaisalmer Golden Fort (Sonar Qila)', 'Camel desert safari and folk music camp under stars in Sam Sand Dunes', 'Carved balconies of Patwon Ki Haveli and Salim Singh Ki Haveli', 'Boating at peaceful Gadisar Lake surrounded by cenotaphs'],
    imageUrls: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.9,
    reviewCount: 41
  },
  {
    name: 'Kaziranga National Park (Home of the Rhino)',
    tagline: 'Grasslands of the mighty Brahmaputra and one-horned rhinoceros sanctuary',
    description: 'A world-famous UNESCO biodiversity sanctuary in Assam, Kaziranga hosts two-thirds of the world’s great one-horned rhinoceroses, alongside wild water buffalo, Asian elephants, swamp deer, and the elusive Royal Bengal tiger.',
    category: 'Wildlife',
    state: 'Assam',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 3500,
    minDurationDays: 3,
    maxDurationDays: 5,
    travelStyles: ['wildlife', 'family', 'adventure', 'nature'],
    bestSeasons: ['Winter', 'Spring'],
    interests: ['wildlife', 'nature', 'adventure', 'photography'],
    highlights: ['Early morning elephant safari in Central Bagori range', 'Jeep safaris spotting one-horned rhinos grazing in tall elephant grass', 'Orchid and biodiversity park cultural dances', 'Birdwatching for migratory pelicans and hornbills'],
    imageUrls: [
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 26
  },
  {
    name: 'Spiti Valley (Middle Land of High Himalayas)',
    tagline: 'Ancient Tibetan monasteries, lunar landscapes, and fossil villages',
    description: 'A cold mountain desert tucked between Tibet and India, Spiti Valley is renowned for its 1,000-year-old Key and Tabo monasteries, the world’s highest post office at Hikkim, and moonlit reflection across Chandra Taal lake.',
    category: 'Adventure',
    state: 'Himachal Pradesh',
    country: 'India',
    budgetTier: 'budget',
    estimatedDailyCostINR: 2200,
    minDurationDays: 7,
    maxDurationDays: 14,
    travelStyles: ['adventure', 'solo', 'backpacker'],
    bestSeasons: ['Summer', 'Autumn'],
    interests: ['mountain', 'adventure', 'spiritual', 'nature'],
    highlights: ['Key Monastery fortress perched atop a mountain cone', 'Camping alongside the crescent-shaped Chandra Taal lake', 'Mailing a postcard from the world’s highest post office in Hikkim (4,400m)', 'Hunting for 50-million-year-old marine fossils in Langza village'],
    imageUrls: [
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.9,
    reviewCount: 27
  },
  {
    name: 'Pondicherry (French Heritage & Coastal Promenade)',
    tagline: 'Mustard-yellow colonial villas, seaside promenade, and spiritual peace',
    description: 'Combining French Riviera charm with South Indian coastal heritage, Puducherry features bougainvillea-draped heritage houses in White Town, Auroville’s universal township, and bicycle rides along Rock Beach promenade.',
    category: 'Beach',
    state: 'Puducherry',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 2600,
    minDurationDays: 2,
    maxDurationDays: 5,
    travelStyles: ['couple', 'solo', 'cultural', 'relaxation'],
    bestSeasons: ['Winter', 'Autumn', 'Spring'],
    interests: ['beach', 'culture', 'food', 'spiritual', 'history'],
    highlights: ['Bicycle tours through French colonial villas and cafes in White Town', 'Auroville Matrimandir meditation and community tour', 'Sunset stroll along the Goubert Rock Beach Promenade', 'Surfing lessons at Serenity Beach'],
    imageUrls: [
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.7,
    reviewCount: 38
  },
  {
    name: 'Amritsar (The Golden Temple & Heart of Punjab)',
    tagline: 'Pure golden divinity, world-famous langar, and patriotic fervor',
    description: 'Spiritual capital of Sikhism, Amritsar revolves around Sri Harmandir Sahib (The Golden Temple), radiating profound hospitality with its 24/7 free community kitchen feeding 100,000 visitors daily, along with the Wagah Border retreat ceremony.',
    category: 'Spiritual',
    state: 'Punjab',
    country: 'India',
    budgetTier: 'budget',
    estimatedDailyCostINR: 1700,
    minDurationDays: 2,
    maxDurationDays: 4,
    travelStyles: ['cultural', 'family', 'spiritual', 'solo'],
    bestSeasons: ['Winter', 'Autumn', 'Spring'],
    interests: ['spiritual', 'food', 'history', 'culture'],
    highlights: ['Reflections of Sri Harmandir Sahib in the holy Amrit Sarovar', 'Volunteering in the mega community kitchen (Guru Ka Langar)', 'Attending the energetic flag-lowering ceremony at Wagah Border', 'Tasting authentic Amritsari kulcha, creamy lassi, and jalebi'],
    imageUrls: [
      'https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.9,
    reviewCount: 54
  },
  {
    name: 'Ranthambore National Park (Tigers & Ancient Fort)',
    tagline: 'Ancient hilltop fortress where Royal Bengal Tigers roam freely',
    description: 'Once the private hunting grounds of Jaipur Maharajas, Ranthambore is one of the premier national parks in the world to photograph majestic wild Bengal tigers prowling among 10th-century palace ruins and banyan trees.',
    category: 'Wildlife',
    state: 'Rajasthan',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 4200,
    minDurationDays: 2,
    maxDurationDays: 5,
    travelStyles: ['wildlife', 'adventure', 'family', 'couple'],
    bestSeasons: ['Winter', 'Spring'],
    interests: ['wildlife', 'nature', 'adventure', 'history'],
    highlights: ['Open-top safari jeeps tracking Royal Bengal Tigers around lakes', 'Hiking up to the 10th-century UNESCO Ranthambore Fort ruins', 'Birdwatching at Padam Talao and Malik Talao lakes', 'Luxury wildlife glamping tents under starlit skies'],
    imageUrls: [
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 31
  },
  {
    name: 'Ziro Valley (Apatani Culture & Lush Valleys)',
    tagline: 'Paddy-cum-fish farmlands, tribal indigenous traditions, and pine groves',
    description: 'A picturesque plateau in Arunachal Pradesh, Ziro is home to the indigenous Apatani tribe known for sustainable agriculture, traditional bamboo architecture, and the celebrated Ziro Festival of Music.',
    category: 'Cultural',
    state: 'Arunachal Pradesh',
    country: 'India',
    budgetTier: 'budget',
    estimatedDailyCostINR: 2000,
    minDurationDays: 4,
    maxDurationDays: 7,
    travelStyles: ['cultural', 'backpacker', 'solo', 'nature'],
    bestSeasons: ['Autumn', 'Spring'],
    interests: ['culture', 'nature', 'music', 'adventure'],
    highlights: ['Immersion into Apatani tribal villages like Hong and Hari', 'Attending the open-air indie Ziro Festival of Music', 'Trekking through Talley Valley Wildlife Sanctuary', 'Exploring ingenious wet rice-fish cultivation fields'],
    imageUrls: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 22
  },
  {
    name: 'Rann of Kutch (The Great White Desert)',
    tagline: 'Endless crystalline salt marsh glowing under full moon desert skies',
    description: 'The world’s largest salt desert transforms into an infinite shimmering white expanse during winter, brought alive by the vibrant Rann Utsav cultural festival, Kutchi handicrafts, rogan art, and folk music.',
    category: 'Desert',
    state: 'Gujarat',
    country: 'India',
    budgetTier: 'mid-range',
    estimatedDailyCostINR: 3600,
    minDurationDays: 3,
    maxDurationDays: 5,
    travelStyles: ['cultural', 'family', 'couple', 'photography'],
    bestSeasons: ['Winter'],
    interests: ['culture', 'nature', 'food', 'photography'],
    highlights: ['Walking across the endless white salt desert under the full moon', 'Staying in traditional Bhunga mud-huts during Rann Utsav', 'Meeting master artisans of Rogan art and Ajrakh block printing', 'Panoramic desert horizon from Kalo Dungar (Black Hill)'],
    imageUrls: [
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 37
  },
  {
    name: 'Khajuraho (Ancient Temples & Sculptures)',
    tagline: 'Masterpieces of medieval temple architecture and stone expressions of life',
    description: 'Built between 950 and 1050 AD by the Chandela dynasty, the UNESCO World Heritage temples of Khajuraho represent the zenith of Indian temple architecture, celebrated for stone carvings depicting meditation, music, dance, and daily life.',
    category: 'Heritage',
    state: 'Madhya Pradesh',
    country: 'India',
    budgetTier: 'budget',
    estimatedDailyCostINR: 1900,
    minDurationDays: 2,
    maxDurationDays: 4,
    travelStyles: ['cultural', 'history', 'solo', 'couple'],
    bestSeasons: ['Winter', 'Autumn', 'Spring'],
    interests: ['history', 'architecture', 'culture'],
    highlights: ['Kandariya Mahadeva Temple towering western group monuments', 'Evening classical dance festival against temple backdrop', 'Sound and light show narrating Chandela royal legend', 'Cycle ride to tranquil Raneh Falls canyon'],
    imageUrls: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600100397608-f010e422a578?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.7,
    reviewCount: 25
  },
  {
    name: 'Varkala (Cliff Beach & Mineral Springs)',
    tagline: 'Dramatic red laterite cliffs towering directly over the Arabian Sea',
    description: 'Unique along the Indian coastline, Varkala features towering red cliffs directly bordering the Arabian Sea, packed with bohemian cafes, yoga shalas, surf schools, and natural healing mineral springs.',
    category: 'Beach',
    state: 'Kerala',
    country: 'India',
    budgetTier: 'budget',
    estimatedDailyCostINR: 1800,
    minDurationDays: 3,
    maxDurationDays: 7,
    travelStyles: ['backpacker', 'solo', 'couple', 'relaxation'],
    bestSeasons: ['Winter', 'Autumn', 'Spring'],
    interests: ['beach', 'relaxation', 'food', 'nature'],
    highlights: ['Sunset walk along the North Cliff path lined with cafes', 'Surfing mellow breaks at Black Beach and Kappil Beach', 'Ancient 2000-year-old Janardanaswamy Vishnu Temple', 'Ayurvedic massages and cliffside yoga overlooking the ocean'],
    imageUrls: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'
    ],
    averageRating: 4.8,
    reviewCount: 32
  }
];

export const seedDestinations = async () => {
  try {
    logger.info(`Connecting to MongoDB at ${env.MONGODB_URI}...`);
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to MongoDB. Starting destination seed...');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const dest of INDIAN_DESTINATIONS) {
      const destPayload = {
        ...dest,
        imageUrl: dest.imageUrls?.[0] || ''
      };
      const existing = await Destination.findOne({ name: dest.name });
      if (existing) {
        await Destination.updateOne({ _id: existing._id }, { $set: destPayload });
        updatedCount++;
      } else {
        await Destination.create(destPayload);
        insertedCount++;
      }
    }

    const total = await Destination.countDocuments();
    logger.info(`Destination seeding complete!`);
    logger.info(`Inserted: ${insertedCount}, Updated: ${updatedCount}, Total in Database: ${total}`);

    await mongoose.disconnect();
    logger.info('Disconnected from database.');
    return total;
  } catch (error) {
    logger.error('Failed to seed destinations:', error.message);
    process.exit(1);
  }
};

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('seedDestinations.js')) {
  seedDestinations();
}
