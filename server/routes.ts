import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertSpotHuntSchema } from "@shared/schema";
import { notificationService } from "./notification-service";

// Simple in-memory cache for faster API responses
const apiCache = new Map<string, { data: any; timestamp: number; expiry: number }>();

function getFromCache(key: string): any | null {
  const entry = apiCache.get(key);
  if (!entry || Date.now() > entry.expiry) {
    apiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setInCache(key: string, data: any, ttlMs: number): void {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + ttlMs
  });
  
  // Clean up old entries periodically
  if (apiCache.size > 50) {
    const now = Date.now();
    for (const [k, v] of Array.from(apiCache.entries())) {
      if (now > v.expiry) {
        apiCache.delete(k);
      }
    }
  }
}

// Advanced search filter functions
function filterByPriceRange(spot: any, priceRange: string): boolean {
  // If "any" is selected, show all spots
  if (priceRange === 'any') return true;
  
  // Check if spot has structured priceRange field (from OSM)
  if (spot.priceRange) {
    return spot.priceRange === priceRange;
  }
  
  // Fallback to calculated price range for legacy spots
  const spotPriceRange = getSpotPriceRange(spot);
  return spotPriceRange === priceRange;
}

function filterByDietary(spot: any, dietary: string): boolean {
  // If "any" is selected, show all spots
  if (dietary === 'any') return true;
  
  // Check if spot has dietaryOptions array (from OSM)
  if (spot.dietaryOptions && Array.isArray(spot.dietaryOptions)) {
    return spot.dietaryOptions.includes(dietary);
  }
  
  // Fallback to description/name checking for legacy spots
  const description = spot.description.toLowerCase();
  const name = spot.name.toLowerCase();
  
  switch (dietary) {
    case 'vegan':
      return description.includes('vegan') || description.includes('plant-based') || 
             description.includes('açaí') || description.includes('avocado') ||
             description.includes('matcha') || name.includes('vegan') ||
             description.includes('oat milk') || description.includes('almond');
    case 'vegetarian':
      return description.includes('vegetarian') || description.includes('vegan') || 
             description.includes('plant-based') || description.includes('salad') ||
             description.includes('açaí') || description.includes('avocado');
    case 'gluten_free':
      return description.includes('gluten') || description.includes('quinoa') ||
             description.includes('rice') || name.includes('gluten');
    case 'keto':
      return description.includes('keto') || description.includes('low-carb') ||
             description.includes('avocado') || description.includes('protein');
    case 'healthy':
      return description.includes('healthy') || description.includes('superfood') || 
             description.includes('organic') || description.includes('açaí') ||
             description.includes('matcha') || description.includes('poke') ||
             description.includes('avocado') || description.includes('quinoa');
    default:
      return true;
  }
}

function filterByAmbiance(spot: any, ambiance: string): boolean {
  // If "any" is selected, show all spots
  if (ambiance === 'any') return true;
  
  // Check if spot has ambiance array (from OSM)
  if (spot.ambiance && Array.isArray(spot.ambiance)) {
    return spot.ambiance.includes(ambiance);
  }
  
  // Fallback to description/name checking for legacy spots
  const description = spot.description.toLowerCase();
  const name = spot.name.toLowerCase();
  
  switch (ambiance) {
    case 'trendy':
      return description.includes('trendy') || description.includes('aesthetic') || 
             description.includes('instagram') || description.includes('matcha') ||
             description.includes('açaí') || description.includes('boba');
    case 'cozy':
      return description.includes('cozy') || name.includes('home') || 
             name.includes('cottage') || description.includes('warm');
    case 'minimalist':
      return description.includes('minimalist') || description.includes('clean') || 
             name.includes('simple') || description.includes('modern');
    case 'vibrant':
      return description.includes('vibrant') || description.includes('colorful') || 
             description.includes('lively') || description.includes('fresh');
    case 'upscale':
      return description.includes('artisan') || description.includes('premium') || 
             description.includes('boutique') || description.includes('gourmet');
    default:
      return true;
  }
}

function getSpotPriceRange(spot: any): string {
  const name = spot.name.toLowerCase();
  const description = spot.description.toLowerCase();
  
  if (name.includes('artisan') || name.includes('boutique') || name.includes('premium') ||
      description.includes('artisan') || description.includes('premium')) {
    return '$$$';
  }
  
  if (name.includes('quick') || name.includes('grab') || name.includes('juice bar')) {
    return '$';
  }
  
  return '$$';
}

// Trendy workout description generators
function getWorkoutDescription(name: string, tags: any): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('f45')) {
    return 'F45 Training – High-tech group fitness with leaderboard anxiety';
  } else if (nameLower.includes('orange') && nameLower.includes('theory')) {
    return 'OrangeTheory – Heart rate monitored HIIT with orange zone goals';
  } else if (nameLower.includes('crossfit')) {
    return 'CrossFit – Functional movements at high intensity with community vibes';
  } else if (nameLower.includes('1rebel')) {
    return '1Rebel – Boutique fitness with neon lights and attitude';
  } else if (nameLower.includes('reformer')) {
    return 'Reformer Pilates – Aesthetic core burn with pastel grip socks';
  } else if (nameLower.includes('megaformer')) {
    return 'Megaformer Class – Feels like torture. Looks like luxury';
  } else if (nameLower.includes('lagree')) {
    return 'Lagree Method – Reformer Pilates but evil';
  } else if (nameLower.includes('hiit')) {
    return 'HIIT Class – Burpees, but make it chic';
  } else if (nameLower.includes('strength')) {
    return 'Strength Training with Aesthetic Dumbbells – Pastel weights, matching set';
  } else if (nameLower.includes('kettlebell')) {
    return 'Kettlebell Flows (lightweight, high rep) – Functional & fashionable';
  } else {
    return 'Boutique fitness studio with trendy group classes and personal training';
  }
}

function getYogaDescription(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('hot') || nameLower.includes('bikram')) {
    return 'Hot Yoga – Sweat out last night\'s wine in 38°C';
  } else if (nameLower.includes('vinyasa')) {
    return 'Vinyasa Flow Yoga – Peaceful, bendy, and secretly intense';
  } else if (nameLower.includes('ashtanga')) {
    return 'Ashtanga Yoga – Traditional sequences for flexibility and strength';
  } else if (nameLower.includes('yin')) {
    return 'Yin Yoga – Deep stretches and meditation for recovery';
  } else if (nameLower.includes('power')) {
    return 'Power Yoga – Athletic flow combining strength and flexibility';
  } else {
    return 'Yoga studio offering mindful movement and meditation practices';
  }
}

function getPilatesDescription(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('reformer')) {
    return 'Reformer Pilates – Aesthetic core burn with pastel grip socks';
  } else if (nameLower.includes('mat')) {
    return 'Mat Pilates – More budget-friendly, still very "that girl"';
  } else if (nameLower.includes('clinical')) {
    return 'Clinical Pilates – Therapeutic movement with physiotherapy benefits';
  } else if (nameLower.includes('contemporary')) {
    return 'Contemporary Pilates – Modern approach to classical technique';
  } else {
    return 'Pilates studio focusing on core strength and body alignment';
  }
}

function getBarreDescription(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('pure')) {
    return 'Pure Barre – Tiny movements, massive pain, balletcore vibes';
  } else if (nameLower.includes('xtend')) {
    return 'Xtend Barre – Ballet-inspired workout with strength and cardio';
  } else if (nameLower.includes('cardio')) {
    return 'Cardio Barre – High-energy barre with dance cardio elements';
  } else {
    return 'Barre Class – Tiny movements, massive pain, balletcore vibes';
  }
}

function getSpinDescription(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('soul')) {
    return 'SoulCycle – Cult-level cardio with spiritual quotes mid-sprint';
  } else if (nameLower.includes('peloton')) {
    return 'Peloton Studio – Real-time leaderboard competition and high-energy music';
  } else if (nameLower.includes('flywheel')) {
    return 'Flywheel Sports – Data-driven indoor cycling with performance tracking';
  } else if (nameLower.includes('aqua')) {
    return 'Aqua Spin Class – Underwater cycling in a sports bra';
  } else {
    return 'Spin Class (non-branded) – Same sweat, less sass';
  }
}

function getDanceDescription(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('zumba')) {
    return 'Zumba – Latin beats and wild hip swings';
  } else if (nameLower.includes('sculpt') && nameLower.includes('society')) {
    return 'Sculpt Society Dance Sculpt – TikTok influencer core workout';
  } else if (nameLower.includes('pole')) {
    return 'Pole Fitness – Sexy, empowering, and an arm workout from hell';
  } else if (nameLower.includes('dance') && nameLower.includes('cardio')) {
    return 'Dance Cardio Class – Get sweaty while pretending you\'re in a music video';
  } else {
    return 'Dance fitness classes combining movement and music';
  }
}

// Generate trendy workout spots when real ones are limited
function generateTrendyWorkoutSpots(userLat: number, userLng: number, radius: number) {
  const workoutSpots = [
    {
      name: 'Pure Barre Paradise',
      description: 'Reformer Pilates – Aesthetic core burn with pastel grip socks',
      category: 'fitness'
    },
    {
      name: 'SoulCycle Sanctuary', 
      description: 'SoulCycle – Cult-level cardio with spiritual quotes mid-sprint',
      category: 'fitness'
    },
    {
      name: 'Barry\'s Bootcamp Elite',
      description: 'Barry\'s Bootcamp – Red lighting, loud beats, and shredded instructors',
      category: 'fitness'
    },
    {
      name: 'Vinyasa Vibes Studio',
      description: 'Vinyasa Flow Yoga – Peaceful, bendy, and secretly intense',
      category: 'fitness'
    },
    {
      name: 'Hot Yoga Haven',
      description: 'Hot Yoga – Sweat out last night\'s wine in 38°C',
      category: 'fitness'
    },
    {
      name: 'F45 Training Hub',
      description: 'F45 Training – High-tech group fitness with leaderboard anxiety',
      category: 'fitness'
    },
    {
      name: 'Lagree Luxury',
      description: 'Lagree Method – Reformer Pilates but evil',
      category: 'fitness'
    },
    {
      name: 'Megaformer Mastery',
      description: 'Megaformer Class – Feels like torture. Looks like luxury',
      category: 'fitness'
    },
    {
      name: 'HIIT Chic Studio',
      description: 'HIIT Class – Burpees, but make it chic',
      category: 'fitness'
    },
    {
      name: 'Barre Belle',
      description: 'Barre Class – Tiny movements, massive pain, balletcore vibes',
      category: 'fitness'
    },
    {
      name: 'Pole Empowerment',
      description: 'Pole Fitness – Sexy, empowering, and an arm workout from hell',
      category: 'fitness'
    },
    {
      name: 'Dance Cardio Dreams',
      description: 'Dance Cardio Class – Get sweaty while pretending you\'re in a music video',
      category: 'fitness'
    },
    {
      name: 'Zumba Zone',
      description: 'Zumba – Latin beats and wild hip swings',
      category: 'fitness'
    },
    {
      name: 'Aqua Spin Oasis',
      description: 'Aqua Spin Class – Underwater cycling in a sports bra',
      category: 'fitness'
    },
    {
      name: 'Rebounder Revival',
      description: 'Rebounder Mini-Trampoline Workout – Lymphatic drainage meets childhood joy',
      category: 'fitness'
    }
  ];

  return workoutSpots.map((spot, index) => {
    // Distribute spots in a circle around user location
    const angle = (index / workoutSpots.length) * 2 * Math.PI;
    const distance = Math.random() * (radius * 0.8) + (radius * 0.2); // 20-100% of radius
    
    const lat = userLat + (distance / 111000) * Math.cos(angle); // ~111km per degree
    const lng = userLng + (distance / (111000 * Math.cos(userLat * Math.PI / 180))) * Math.sin(angle);
    
    return {
      id: `generated-${index}`,
      name: spot.name,
      description: spot.description,
      latitude: lat,
      longitude: lng,
      rating: Math.floor(4.2 + Math.random() * 0.6), // 4-5 (no decimals)
      imageUrl: getAestheticImageUrl({ leisure: 'fitness_centre', sport: 'fitness' }),
      category: 'fitness',
      trending: Math.random() > 0.5,
      huntCount: Math.floor(Math.random() * 25) + 10,
      distance: Math.round(distance),
      priceRange: Math.random() > 0.3 ? '$$$' : '$$',
      dietaryOptions: [],
      ambiance: ['trendy', 'energetic'],
      amenities: ['changing rooms', 'showers', 'parking']
    };
  });
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

async function findNearbyTrendySpots(lat: number, lng: number, radius: number) {
  try {
    // Optimized Overpass API query - reduced timeout and more focused search
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"~"^(cafe|restaurant|juice_bar|gym)$"](around:${radius},${lat},${lng});
        way["amenity"~"^(cafe|restaurant|juice_bar|gym)$"](around:${radius},${lat},${lng});
        node["shop"~"^(coffee|tea|bakery|sports)$"](around:${radius},${lat},${lng});
        way["shop"~"^(coffee|tea|bakery|sports)$"](around:${radius},${lat},${lng});
        node["leisure"~"^(fitness_centre|sports_centre)$"](around:${radius},${lat},${lng});
        way["leisure"~"^(fitness_centre|sports_centre)$"](around:${radius},${lat},${lng});
        node["sport"~"^(fitness|yoga|pilates)$"](around:${radius},${lat},${lng});
        way["sport"~"^(fitness|yoga|pilates)$"](around:${radius},${lat},${lng});
      );
      out geom;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      console.warn('Overpass API request failed:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) {
      return [];
    }



    // Convert OSM data to our spot format
    const spots = data.elements
      .filter((element: any) => element.lat && element.lon && element.tags && element.tags.name)
      .map((element: any) => convertOSMToSpot(element, lat, lng))
      .filter((spot: any) => spot && isTrendyPlace(spot));

    const uniqueResults = removeDuplicates(spots);
    // Sort by distance for nearby spots and limit early for performance
    return uniqueResults
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 20); // Reduced from 25 to 20 for faster response

  } catch (error) {
    console.warn('Failed to fetch nearby spots from OSM:', error);
    return [];
  }
}

function convertOSMToSpot(element: any, userLat: number, userLng: number) {
  const tags = element.tags || {};
  const placeLat = element.lat || (element.center ? element.center.lat : 0);
  const placeLng = element.lon || (element.center ? element.center.lon : 0);
  
  if (!placeLat || !placeLng) return null;
  
  const distance = calculateDistance(userLat, userLng, placeLat, placeLng);
  
  // Generate a consistent but varied rating based on name and type (whole numbers only)
  const nameHash = (tags.name || '').split('').reduce((hash: number, char: string) => hash + char.charCodeAt(0), 0);
  const rating = Math.floor(3.5 + ((nameHash % 20) / 40)); // Range: 3-4, whole numbers only
  
  return {
    id: element.id || Math.random().toString(),
    name: tags.name || 'Local Spot',
    description: getOSMDescription(tags),
    latitude: placeLat,
    longitude: placeLng,
    rating: Math.max(4, Math.min(5, rating)), // Ensure 4-5 range, whole numbers
    imageUrl: getAestheticImageUrl(tags),
    category: getOSMCategory(tags),
    trending: rating >= 3.8,
    huntCount: Math.floor(Math.random() * 30) + 5,
    distance: Math.round(distance),
    amenity: tags.amenity,
    cuisine: tags.cuisine,
    leisure: tags.leisure,
    sport: tags.sport,
    shop: tags.shop,
    website: tags.website,
    phone: tags.phone,
    // Add filter fields for OpenStreetMap spots
    priceRange: getOSMPriceRange(tags),
    dietaryOptions: getOSMDietaryOptions(tags),
    ambiance: getOSMAmbiance(tags),
    amenities: getOSMAmenities(tags)
  };
}

function getOSMDescription(tags: any): string {
  const amenity = tags.amenity || '';
  const cuisine = tags.cuisine || '';
  const shop = tags.shop || '';
  const leisure = tags.leisure || '';
  const sport = tags.sport || '';
  const name = (tags.name || '').toLowerCase();
  const brand = tags.brand || '';
  
  let description = '';
  
  // Use actual OSM description if available
  if (tags.description) {
    return tags.description;
  }
  
  // Brand-specific descriptions for accuracy
  if (brand) {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('starbucks')) {
      description = 'Coffee shop serving hot and cold beverages, pastries and light meals';
    } else if (brandLower.includes('costa')) {
      description = 'Coffee chain offering espresso drinks, sandwiches and cakes';
    } else if (brandLower.includes('pret')) {
      description = 'Fresh sandwiches, salads, wraps and organic coffee';
    } else if (brandLower.includes('subway')) {
      description = 'Submarine sandwiches and salads made to order';
    } else if (brandLower.includes('mcdonald')) {
      description = 'Fast food restaurant serving burgers, fries and beverages';
    } else if (brandLower.includes('kfc')) {
      description = 'Fried chicken restaurant with original recipe';
    } else if (brandLower.includes('nando')) {
      description = 'Peri-peri chicken restaurant with Portuguese flavors';
    } else if (brandLower.includes('wagamama')) {
      description = 'Asian kitchen serving fresh noodles, rice dishes and curries';
    } else if (brandLower.includes('leon')) {
      description = 'Naturally fast food with healthy options';
    } else {
      description = `${brand} location`;
    }
  } else {
    // Generate trendy fitness descriptions based on OSM tags and name
    if (leisure === 'fitness_centre' || leisure === 'sports_centre' || amenity === 'gym') {
      description = getWorkoutDescription(name, tags);
    } else if (sport === 'yoga' || name.includes('yoga')) {
      description = getYogaDescription(name);
    } else if (sport === 'pilates' || name.includes('pilates')) {
      description = getPilatesDescription(name);
    } else if (name.includes('barre') || sport === 'aerobics') {
      description = getBarreDescription(name);
    } else if (name.includes('soul') && name.includes('cycle')) {
      description = 'SoulCycle – Cult-level cardio with spiritual quotes mid-sprint';
    } else if (name.includes('barry') || name.includes('bootcamp')) {
      description = 'Barry\'s Bootcamp – Red lighting, loud beats, and shredded instructors';
    } else if (name.includes('pure') && name.includes('barre')) {
      description = 'Pure Barre – Reformer Pilates aesthetic core burn with pastel grip socks';
    } else if (sport === 'cycling' || name.includes('spin')) {
      description = getSpinDescription(name);
    } else if (sport === 'dance' || name.includes('dance')) {
      description = getDanceDescription(name);
    } else if (name.includes('pole')) {
      description = 'Pole Fitness – Sexy, empowering, and an arm workout from hell';
    } else if (name.includes('alo') && name.includes('moves')) {
      description = 'Alo Moves App Workout – Streamed elegance from your neutral-toned living room';
    } else if (name.includes('treadmill') || name.includes('12-3-30')) {
      description = 'Treadmill Incline Walking (12-3-30) – A treadmill trend turned religion';
    } else if (name.includes('stairmaster')) {
      description = 'StairMaster Sesh – Glute burn + podcast = gym girl canon';
    } else if (name.includes('booty') || name.includes('glute')) {
      description = 'Booty Band Glute Workout – For the 🍑';
    } else if (name.includes('jump') && name.includes('rope')) {
      description = 'Jump Rope Burnouts – Box like a Victoria\'s Secret model';
    } else if (name.includes('rebounder') || name.includes('trampoline')) {
      description = 'Rebounder Mini-Trampoline Workout – Lymphatic drainage meets childhood joy';
    } else if (sport === 'fitness' || name.includes('gym')) {
      description = 'Gym with weights, cardio equipment and fitness classes';
    } else if (amenity === 'cafe' || name.includes('cafe') || name.includes('coffee')) {
      description = 'Coffee shop serving espresso drinks and light refreshments';
    } else if (shop === 'bakery' || name.includes('bakery')) {
      description = 'Bakery selling fresh bread, pastries and baked goods';
    } else if (amenity === 'restaurant') {
      if (cuisine === 'japanese') {
        description = 'Japanese restaurant serving sushi, ramen and traditional dishes';
      } else if (cuisine === 'italian') {
        description = 'Italian restaurant with pasta, pizza and Mediterranean cuisine';
      } else if (cuisine === 'chinese') {
        description = 'Chinese restaurant with traditional and modern dishes';
      } else if (cuisine === 'indian') {
        description = 'Indian restaurant serving curry, tandoor and regional specialties';
      } else if (cuisine === 'thai') {
        description = 'Thai restaurant with authentic Southeast Asian cuisine';
      } else if (cuisine === 'mexican') {
        description = 'Mexican restaurant serving tacos, burritos and Latin dishes';
      } else if (cuisine === 'pizza') {
        description = 'Pizza restaurant with traditional and specialty options';
      } else if (cuisine === 'burger') {
        description = 'Burger restaurant with classic and gourmet options';
      } else if (cuisine === 'sandwich') {
        description = 'Sandwich shop with fresh ingredients and custom options';
      } else if (cuisine === 'seafood') {
        description = 'Seafood restaurant with fresh fish and ocean specialties';
      } else if (cuisine === 'vegetarian' || cuisine === 'vegan') {
        description = 'Plant-based restaurant with vegetarian and vegan dishes';
      } else if (cuisine === 'kebab') {
        description = 'Kebab shop serving grilled meats and Middle Eastern food';
      } else if (cuisine === 'fish_and_chips') {
        description = 'Traditional fish and chips takeaway';
      } else if (cuisine) {
        description = `${cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} restaurant`;
      } else {
        description = 'Restaurant serving a variety of dishes';
      }
    } else if (amenity === 'fast_food') {
      if (cuisine === 'burger') {
        description = 'Fast food burger restaurant';
      } else if (cuisine === 'pizza') {
        description = 'Fast food pizza restaurant';
      } else if (cuisine === 'chicken') {
        description = 'Fast food chicken restaurant';
      } else {
        description = 'Fast food restaurant with quick service';
      }
    } else if (shop === 'convenience') {
      description = 'Convenience store with everyday essentials and snacks';
    } else if (shop === 'supermarket') {
      description = 'Supermarket with groceries and household items';
    } else if (amenity === 'bar' || amenity === 'pub') {
      description = 'Bar serving alcoholic beverages and pub food';
    } else if (shop === 'clothes' || shop === 'fashion') {
      description = 'Clothing store with fashion and apparel';
    } else if (shop === 'beauty' || shop === 'hairdresser') {
      description = 'Beauty salon offering hair and cosmetic services';
    } else if (amenity === 'pharmacy') {
      description = 'Pharmacy providing medications and health products';
    } else if (amenity === 'bank') {
      description = 'Bank branch offering financial services';
    } else if (amenity === 'fuel') {
      description = 'Petrol station with fuel and convenience items';
    } else if (shop === 'electronics') {
      description = 'Electronics store with phones, computers and gadgets';
    } else if (shop === 'books') {
      description = 'Bookstore with books, magazines and reading materials';
    } else {
      // Generic fallback based on primary tag
      const primaryTag = amenity || shop || leisure || sport || 'business';
      description = primaryTag.replace(/_/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase());
    }
  }
  
  // Add practical information
  const features = [];
  if (tags.outdoor_seating === 'yes') features.push('outdoor seating');
  if (tags.wifi === 'yes' || tags.internet_access === 'wlan') features.push('WiFi');
  if (tags.takeaway === 'yes') features.push('takeaway');
  if (tags.delivery === 'yes') features.push('delivery');
  if (tags.wheelchair === 'yes') features.push('wheelchair accessible');
  if (tags.parking === 'yes') features.push('parking available');
  
  if (features.length > 0) {
    description += ` • ${features.join(', ')}`;
  }
  
  return description;
}

function getAestheticImageUrl(tags: any): string {
  // Images are now replaced with icons in the frontend
  // Return a placeholder that won't be used since we use icons
  return '/placeholder-icon.svg';
}

function getOSMCategory(tags: any): string {
  const amenity = tags.amenity || '';
  const leisure = tags.leisure || '';
  const sport = tags.sport || '';
  const shop = tags.shop || '';
  
  // Fitness categories
  if (leisure === 'fitness_centre' || leisure === 'sports_centre' || sport === 'fitness' || sport === 'yoga' || sport === 'pilates' || sport === 'aerobics' || sport === 'gymnastics' || shop === 'sports') {
    return 'gym';
  }
  
  const categoryMap: { [key: string]: string } = {
    'cafe': 'café',
    'restaurant': 'restaurant',
    'juice_bar': 'café',
    'bar': 'restaurant'
  };
  
  return categoryMap[amenity] || 'trendy';
}

function getOSMPriceRange(tags: any): string {
  // Generate price range based on tags and location indicators
  const name = (tags.name || '').toLowerCase();
  const amenity = tags.amenity || '';
  
  // High-end indicators
  if (name.includes('artisan') || name.includes('boutique') || name.includes('premium') || 
      name.includes('gourmet') || tags.organic === 'yes' || tags.fair_trade === 'yes') {
    return '$$$';
  }
  
  // Budget indicators
  if (name.includes('quick') || name.includes('express') || name.includes('grab') ||
      amenity === 'fast_food') {
    return '$';
  }
  
  // Default to mid-range for most trendy spots
  return '$$';
}

function getOSMDietaryOptions(tags: any): string[] {
  const options: string[] = [];
  const name = (tags.name || '').toLowerCase();
  const cuisine = tags.cuisine || '';
  
  // Check for dietary options based on tags and name
  if (tags.vegan === 'yes' || tags.diet_vegan === 'yes' || cuisine === 'vegan' || 
      name.includes('vegan') || name.includes('plant')) {
    options.push('vegan');
  }
  
  if (tags.vegetarian === 'yes' || cuisine === 'vegetarian' || name.includes('vegetarian')) {
    options.push('vegetarian');
  }
  
  if (tags.gluten_free === 'yes' || name.includes('gluten') || name.includes('celiac')) {
    options.push('gluten_free');
  }
  
  if (name.includes('keto') || name.includes('low-carb') || name.includes('protein')) {
    options.push('keto');
  }
  
  if (tags.organic === 'yes' || name.includes('organic') || name.includes('healthy') ||
      name.includes('superfood') || name.includes('detox') || name.includes('açaí') ||
      name.includes('acai') || name.includes('quinoa')) {
    options.push('healthy');
  }
  
  return options;
}

function getOSMAmbiance(tags: any): string[] {
  const ambiance: string[] = [];
  const name = (tags.name || '').toLowerCase();
  const description = getOSMDescription(tags).toLowerCase();
  
  // Determine ambiance based on keywords
  if (name.includes('trendy') || name.includes('aesthetic') || name.includes('instagram') ||
      name.includes('matcha') || name.includes('boba') || name.includes('açaí') ||
      description.includes('aesthetic') || description.includes('instagram')) {
    ambiance.push('trendy');
  }
  
  if (name.includes('cozy') || name.includes('home') || name.includes('cottage') ||
      name.includes('warm') || description.includes('cozy')) {
    ambiance.push('cozy');
  }
  
  if (name.includes('minimalist') || name.includes('clean') || name.includes('simple') ||
      name.includes('modern') || description.includes('minimalist')) {
    ambiance.push('minimalist');
  }
  
  if (name.includes('vibrant') || name.includes('colorful') || name.includes('lively') ||
      name.includes('fresh') || description.includes('vibrant')) {
    ambiance.push('vibrant');
  }
  
  if (name.includes('artisan') || name.includes('premium') || name.includes('boutique') ||
      name.includes('gourmet') || description.includes('artisan')) {
    ambiance.push('upscale');
  }
  
  // Default to trendy if no specific ambiance found
  if (ambiance.length === 0) {
    ambiance.push('trendy');
  }
  
  return ambiance;
}

function getOSMAmenities(tags: any): string[] {
  const amenities: string[] = [];
  
  // Check for common amenities
  if (tags.wifi === 'yes' || tags.internet_access === 'wifi') {
    amenities.push('wifi');
  }
  
  if (tags.outdoor_seating === 'yes') {
    amenities.push('outdoor_seating');
  }
  
  if (tags.takeaway === 'yes') {
    amenities.push('takeaway');
  }
  
  if (tags.delivery === 'yes') {
    amenities.push('delivery');
  }
  
  if (tags.wheelchair === 'yes') {
    amenities.push('accessible');
  }
  
  return amenities;
}

function isTrendyPlace(place: any): boolean {
  const name = place.name?.toLowerCase() || '';
  const amenity = place.amenity?.toLowerCase() || '';
  const shop = place.shop?.toLowerCase() || '';
  const cuisine = place.cuisine?.toLowerCase() || '';
  const leisure = place.leisure?.toLowerCase() || '';
  const sport = place.sport?.toLowerCase() || '';
  
  // Exclude fast food chains and non-aesthetic places
  const excludeKeywords = [
    'mcdonald', 'burger king', 'kfc', 'subway', 'domino', 'pizza hut',
    'taco bell', 'wendy', 'arby', 'popeye', 'dairy queen', 'sonic',
    'fast food', 'drive thru', 'drive-thru', 'chain', 'franchise'
  ];

  const shouldExclude = excludeKeywords.some(keyword => 
    name.includes(keyword)
  );

  if (shouldExclude) return false;

  // Prioritize trendy, aesthetic keywords
  const trendyKeywords = [
    // Drinks
    'matcha', 'latte', 'boba', 'bubble tea', 'chai', 'kombucha',
    'juice', 'smoothie', 'refresher', 'oat milk', 'coconut',
    'lavender', 'rose', 'detox', 'cold brew', 'nitro',
    // Food
    'avocado', 'toast', 'acai', 'bowl', 'poke', 'quinoa',
    'vegan', 'plant based', 'organic', 'healthy', 'superfood',
    'charcuterie', 'overnight oats', 'buddha bowl', 'cauliflower',
    // Sweets & Aesthetic
    'macaron', 'cupcake', 'artisan', 'craft', 'local', 'farm',
    'boutique', 'specialty', 'gourmet', 'aesthetic', 'instagram',
    'cute', 'cozy', 'chic', 'modern', 'minimalist', 'rustic',
    // Fitness & Wellness
    'yoga', 'pilates', 'barre', 'soul', 'pure', 'fitness',
    'studio', 'wellness', 'reformer', 'hot', 'cycle', 'spin',
    'boxing', 'kickboxing', 'crossfit', 'bootcamp', 'hiit',
    'dance', 'sculpt', 'stretch', 'meditation', 'mindful'
  ];

  const trendyTypes = [
    'cafe', 'coffee', 'juice_bar', 'health_food', 'organic',
    'bakery', 'tea', 'bubble_tea', 'vegan', 'vegetarian'
  ];

  const fitnessTypes = [
    'sports_centre', 'fitness_centre', 'fitness_station'
  ];

  const fitnessSports = [
    'yoga', 'pilates', 'fitness', 'aerobics', 'gymnastics'
  ];

  const hasTrendyKeyword = trendyKeywords.some(keyword => 
    name.includes(keyword)
  );

  const hasTrendyAmenity = amenity === 'cafe' || amenity === 'juice_bar';
  const hasTrendyShop = trendyTypes.includes(shop);
  const hasTrendyCuisine = ['vegan', 'vegetarian', 'healthy', 'bubble_tea', 'coffee_shop'].includes(cuisine);
  const hasFitnessLeisure = fitnessTypes.includes(leisure);
  const hasFitnessSport = fitnessSports.includes(sport);
  
  // For restaurants, be more selective
  if (amenity === 'restaurant') {
    return hasTrendyKeyword || hasTrendyCuisine;
  }

  // Always include fitness places if they match our fitness criteria
  if (hasFitnessLeisure || hasFitnessSport) {
    return true;
  }

  return hasTrendyKeyword || hasTrendyAmenity || hasTrendyShop || hasTrendyCuisine;
}

function removeDuplicates(places: any[]): any[] {
  const seen = new Set();
  return places.filter(place => {
    const key = `${place.name}-${place.geometry?.location?.lat}-${place.geometry?.location?.lng}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function convertGooglePlaceToSpot(place: any, userLat: number, userLng: number) {
  const placeLat = place.geometry?.location?.lat || 0;
  const placeLng = place.geometry?.location?.lng || 0;
  const distance = calculateDistance(userLat, userLng, placeLat, placeLng);
  
  return {
    id: place.place_id || Math.random().toString(),
    name: place.name || 'Unknown Place',
    description: getPlaceDescription(place),
    latitude: placeLat,
    longitude: placeLng,
    rating: place.rating || 4.0,
    imageUrl: getPlaceImageUrl(place),
    category: getCategoryFromTypes(place.types || []),
    trending: place.rating >= 4.3,
    huntCount: Math.floor(Math.random() * 50) + 10,
    distance: Math.round(distance)
  };
}

function getPlaceDescription(place: any): string {
  const types = place.types || [];
  const priceLevel = place.price_level;
  
  let description = '';
  
  if (types.includes('coffee_shop') || types.includes('cafe')) {
    description = '☕ Trendy coffee spot with aesthetic vibes';
  } else if (types.includes('restaurant')) {
    description = '🍽️ Instagram-worthy dining experience';
  } else if (types.includes('bakery')) {
    description = '🥐 Fresh pastries and aesthetic treats';
  } else if (types.includes('meal_takeaway')) {
    description = '🥗 Quick & healthy on-the-go meals';
  } else {
    description = '✨ Trendy spot perfect for your feed';
  }
  
  if (priceLevel) {
    description += ` • ${'$'.repeat(priceLevel)}`;
  }
  
  return description;
}

function getPlaceImageUrl(place: any): string {
  // Images are now replaced with icons in the frontend
  // Return a placeholder that won't be used since we use icons
  return '/placeholder-icon.svg';
}

function getCategoryFromTypes(types: string[]): string {
  if (types.includes('coffee_shop') || types.includes('cafe')) return 'coffee';
  if (types.includes('restaurant')) return 'restaurant';
  if (types.includes('bakery')) return 'bakery';
  if (types.includes('meal_takeaway')) return 'takeaway';
  return 'food';
}

function sortByTrendiness(spots: any[]): any[] {
  return spots.sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    
    if (ratingA !== ratingB) {
      return ratingB - ratingA;
    }
    
    return (a.distance || 0) - (b.distance || 0);
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, firstName, lastName, dateOfBirth, acceptTerms } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName || !dateOfBirth || !acceptTerms) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Account already exists with this email" });
      }

      // Validate age (must be 13+)
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        return res.status(400).json({ message: "You must be at least 13 years old" });
      }

      // Create user account
      const user = await storage.createUserAccount({
        email,
        firstName,
        lastName,
        dateOfBirth: birthDate,
        username: `${firstName.toLowerCase()}_${Math.random().toString(36).substring(7)}`,
      });

      res.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
  // Auth middleware setup
  await setupAuth(app);

  // Demo mode - no authentication required for any API routes

  // Config routes
  app.get("/api/config", (req, res) => {
    res.json({
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    });
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Validate user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user profile
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(400).json({ message: "Failed to update user" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    const updatedUser = await storage.updateUser(parseInt(req.params.id), req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  });

  app.get('/api/user/:id/stats', async (req, res) => {
    try {
      const stats = await storage.getUserStats(parseInt(req.params.id));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/user/:id/achievements', async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements(parseInt(req.params.id));
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Spots routes
  app.get("/api/spots", async (req, res) => {
    const spots = await storage.getAllSpots();
    res.json(spots);
  });

  app.get("/api/spots/trending", async (req, res) => {
    const spots = await storage.getTrendingSpots();
    res.json(spots);
  });

  app.get("/api/spots/gym", async (req, res) => {
    try {
      // Get user location from query params if available
      const { lat, lng, radius = 3000 } = req.query;
      
      if (lat && lng) {
        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);
        
        // First try to get real fitness spots from OpenStreetMap
        let gymSpots = await findNearbyTrendySpots(userLat, userLng, parseInt(radius as string));
        gymSpots = gymSpots.filter(spot => 
          spot.category === 'fitness' || 
          spot.leisure === 'fitness_centre' || 
          spot.sport === 'fitness' ||
          spot.sport === 'yoga' ||
          spot.sport === 'pilates'
        );
        
        // Only use real fitness spots - no fake generated ones
        console.log(`Found ${gymSpots.length} real fitness spots`);
        
        // Filter and enhance real gym spots only
        const allGymSpots = gymSpots
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          .slice(0, 15) // Limit to 15 real spots
          .map(spot => ({
            ...spot,
            rating: Math.floor(spot.rating || 4.2) // Remove decimals from rating
          }));
        
        res.json(allGymSpots);
      } else {
        // Fallback to stored spots if no location provided
        const spots = await storage.getGymClasses();
        res.json(spots);
      }
    } catch (error) {
      console.error("Error fetching gym spots:", error);
      // Fallback to stored spots on error
      const spots = await storage.getGymClasses();
      res.json(spots);
    }
  });



  // Get nearby spots based on user location using OpenStreetMap with advanced filters
  app.get("/api/spots/nearby", async (req, res) => {
    try {
      const { 
        lat, 
        lng, 
        radius = 1500,
        limit = 20,
        priceRange,
        dietary,
        ambiance,
        category,
        search 
      } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const searchRadius = parseInt(radius as string);
      const maxResults = parseInt(limit as string);
      
      console.log(`Finding nearby spots for location: ${userLat}, ${userLng} within ${searchRadius}m (limit: ${maxResults})`);
      
      // Create cache key for this request
      const cacheKey = `spots:${Math.round(userLat * 1000) / 1000}:${Math.round(userLng * 1000) / 1000}:${Math.round(searchRadius / 500) * 500}:${JSON.stringify({ category, search, priceRange, dietary, ambiance })}`;
      
      // Check cache first for faster response
      const cachedSpots = getFromCache(cacheKey);
      if (cachedSpots) {
        console.log(`Cache hit for ${cacheKey} - returning ${cachedSpots.length} cached spots`);
        res.set('Cache-Control', 'public, max-age=300'); // 5 minute cache
        res.set('X-Cache', 'HIT');
        return res.json(cachedSpots.slice(0, maxResults));
      }
      
      // Set cache headers for better performance
      res.set('Cache-Control', 'public, max-age=300'); // 5 minute cache
      res.set('X-Cache', 'MISS');
      
      // Use OpenStreetMap to find nearby trendy spots (completely free)
      let nearbySpots = await findNearbyTrendySpots(userLat, userLng, searchRadius);
      
      console.log(`Found ${nearbySpots.length} spots from OSM for ${userLat}, ${userLng}`);
      
      // Apply advanced filters
      if (priceRange) {
        nearbySpots = nearbySpots.filter(spot => filterByPriceRange(spot, priceRange as string));
      }
      
      if (dietary) {
        nearbySpots = nearbySpots.filter(spot => filterByDietary(spot, dietary as string));
      }
      
      if (ambiance) {
        nearbySpots = nearbySpots.filter(spot => filterByAmbiance(spot, ambiance as string));
      }
      
      if (category) {
        nearbySpots = nearbySpots.filter(spot => spot.category === category);
      }
      
      // Apply search filter - search in name, description, category, and dietary options
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        nearbySpots = nearbySpots.filter(spot => {
          const matchesName = spot.name.toLowerCase().includes(searchTerm);
          const matchesDescription = spot.description?.toLowerCase().includes(searchTerm);
          const matchesCategory = spot.category?.toLowerCase().includes(searchTerm);
          const matchesDietary = spot.dietaryOptions?.some((opt: string) => 
            opt.toLowerCase().includes(searchTerm)
          );
          const matchesAmenities = spot.amenities?.some((amenity: string) => 
            amenity.toLowerCase().includes(searchTerm)
          );
          
          return matchesName || matchesDescription || matchesCategory || matchesDietary || matchesAmenities;
        });
      }
      
      // Sort by distance first for nearby spots and limit results early
      nearbySpots = nearbySpots
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, maxResults);
      
      // Cache the results for faster subsequent requests
      setInCache(cacheKey, nearbySpots, 300000); // 5 minute cache
      
      console.log(`Found ${nearbySpots.length} spots, closest distances:`, 
        nearbySpots.slice(0, 5).map(s => `${s.name}: ${s.distance}m`));
      
      // If we have very few fitness spots, supplement with trendy workout classes
      if (category === 'fitness' && nearbySpots.length < 8) {
        console.log(`Only ${nearbySpots.length} fitness spots found, adding trendy workout classes`);
        const trendyWorkouts = generateTrendyWorkoutSpots(userLat, userLng, searchRadius);
        nearbySpots = [...nearbySpots, ...trendyWorkouts].slice(0, 15);
      }
      
      if (nearbySpots.length === 0) {
        // Fallback to stored spots if OSM returns no results after filtering
        const allSpots = await storage.getAllSpots();
        let fallbackSpots = allSpots
          .map(spot => ({
            ...spot,
            distance: calculateDistance(userLat, userLng, spot.latitude, spot.longitude)
          }))
          .filter(spot => spot.distance <= searchRadius);
          
        // Apply the same filters to fallback spots
        if (priceRange && priceRange !== 'any') {
          fallbackSpots = fallbackSpots.filter(spot => filterByPriceRange(spot, priceRange as string));
        }
        
        if (dietary && dietary !== 'any') {
          fallbackSpots = fallbackSpots.filter(spot => filterByDietary(spot, dietary as string));
        }
        
        if (ambiance && ambiance !== 'any') {
          fallbackSpots = fallbackSpots.filter(spot => filterByAmbiance(spot, ambiance as string));
        }
        
        if (category) {
          fallbackSpots = fallbackSpots.filter(spot => spot.category === category);
        }
        
        if (search) {
          const searchTerm = (search as string).toLowerCase();
          fallbackSpots = fallbackSpots.filter(spot => {
            const matchesName = spot.name.toLowerCase().includes(searchTerm);
            const matchesDescription = spot.description?.toLowerCase().includes(searchTerm);
            const matchesCategory = spot.category?.toLowerCase().includes(searchTerm);
            const matchesDietary = spot.dietaryOptions?.some(opt => 
              opt.toLowerCase().includes(searchTerm)
            );
            const matchesAmenities = spot.amenities?.some(amenity => 
              amenity.toLowerCase().includes(searchTerm)
            );
            
            return matchesName || matchesDescription || matchesCategory || matchesDietary || matchesAmenities;
          });
        }
        
        return res.json(fallbackSpots.sort((a, b) => a.distance - b.distance));
      }
      
      res.json(nearbySpots);
      
    } catch (error) {
      console.error("Error fetching nearby spots:", error);
      res.status(500).json({ message: "Failed to get nearby spots" });
    }
  });

  app.get("/api/spots/:id", async (req, res) => {
    const spot = await storage.getSpot(parseInt(req.params.id));
    if (!spot) {
      return res.status(404).json({ message: "Spot not found" });
    }
    res.json(spot);
  });

  app.post("/api/spots/:id/hunt", async (req, res) => {
    try {
      const spotId = parseInt(req.params.id);
      const { userId, userLatitude, userLongitude, spotData } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Validate location data
      if (!userLatitude || !userLongitude) {
        return res.status(400).json({ message: "Location data required for check-in" });
      }
      
      // Try to get spot from storage first, if not found and spotData provided, create it
      let spot = await storage.getSpot(spotId);
      if (!spot && spotData) {
        // Create spot from OpenStreetMap data
        spot = await storage.createSpot({
          id: spotId,
          name: spotData.name,
          description: spotData.description,
          category: spotData.category,
          latitude: spotData.latitude,
          longitude: spotData.longitude,
          address: spotData.address || "",
          rating: spotData.rating || 4.5,
          huntCount: 0,
          imageUrl: spotData.imageUrl || "",
          trending: false,
          priceRange: spotData.priceRange || "$$",
          dietaryOptions: spotData.dietaryOptions || [],
          ambiance: spotData.ambiance || [],
          amenities: spotData.amenities || []
        });
      }
      
      if (!spot) {
        return res.status(404).json({ message: "Spot not found" });
      }
      
      // Calculate distance between user and spot
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        spot.latitude,
        spot.longitude
      );
      
      // Check if user is within 100 meters of the spot
      const maxDistance = 100; // meters
      if (distance > maxDistance) {
        return res.status(403).json({ 
          message: "Too far from location", 
          distance: Math.round(distance),
          maxDistance,
          spotName: spot.name,
          details: `You need to be within ${maxDistance}m of ${spot.name} to check in. You're ${Math.round(distance)}m away.`
        });
      }

      // Get user badges before hunting to compare
      const badgesBefore = await storage.getUserBadges(parseInt(userId));
      const badgeCountBefore = badgesBefore.length;
      
      const spotHunt = await storage.huntSpot(parseInt(userId), spotId);
      
      // Update challenge progress for matcha spots
      if (spot && spot.category === 'cafe') {
        await storage.updateChallengeProgress(parseInt(userId), 1, 2); // Update to current progress
      }

      // Get updated user badges to check if new badges were awarded
      const badgesAfter = await storage.getUserBadges(parseInt(userId));
      const newBadges = badgesAfter.slice(badgeCountBefore); // Get only new badges
      
      // Get updated user info with new points
      const updatedUser = await storage.getUser(parseInt(userId));

      res.json({ 
        ...spotHunt, 
        distance: Math.round(distance),
        verified: true,
        newBadges: newBadges.map(ub => ub.badge),
        pointsEarned: spotHunt.pointsEarned,
        totalPoints: updatedUser?.totalPoints || 0,
        spotsHunted: updatedUser?.spotsHunted || 0
      });
    } catch (error) {
      console.error("Hunt spot error:", error);
      res.status(500).json({ message: "Failed to hunt spot", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Badges routes
  app.get("/api/badges", async (req, res) => {
    const badges = await storage.getAllBadges();
    res.json(badges);
  });

  app.get("/api/user/:id/badges", async (req, res) => {
    const userBadges = await storage.getUserBadges(parseInt(req.params.id));
    res.json(userBadges);
  });

  // Challenges routes
  app.get("/api/challenges", async (req, res) => {
    const challenges = await storage.getActiveChallenges();
    res.json(challenges);
  });

  app.get("/api/user/:id/challenges", async (req, res) => {
    const progress = await storage.getUserChallengeProgress(parseInt(req.params.id));
    res.json(progress);
  });

  // Rewards routes
  app.get("/api/rewards", async (req, res) => {
    const rewards = await storage.getAvailableRewards(1); // Default user
    res.json(rewards);
  });

  app.post("/api/rewards/:id/claim", async (req, res) => {
    const { userId } = req.body;
    const success = await storage.claimReward(userId, parseInt(req.params.id));
    
    if (success) {
      res.json({ message: "Reward claimed successfully!" });
    } else {
      res.status(400).json({ message: "Failed to claim reward" });
    }
  });

  // Activity feed
  app.get("/api/activity", async (req, res) => {
    const activity = await storage.getRecentActivity();
    res.json(activity);
  });

  // Calendar API routes
  app.get("/api/user/:userId/availability/:month", async (req, res) => {
    try {
      const { userId, month } = req.params;
      const availability = await storage.getUserAvailability(userId, month);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user availability" });
    }
  });

  app.post("/api/user/:userId/availability", async (req, res) => {
    try {
      const { userId } = req.params;
      const { date, isAvailable, note } = req.body;
      const availability = await storage.setUserAvailability(userId, date, isAvailable, note);
      res.json(availability);
    } catch (error) {
      res.status(400).json({ message: "Failed to set availability" });
    }
  });

  app.get("/api/user/:userId/friends-availability/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const friendsAvailability = await storage.getFriendsAvailability(userId, date);
      res.json(friendsAvailability);
    } catch (error) {
      res.status(500).json({ message: "Failed to get friends availability" });
    }
  });

  // Social API routes
  // Friends
  app.post("/api/friends/request", async (req, res) => {
    try {
      const { requesterId, addresseeId } = req.body;
      const friendship = await storage.sendFriendRequest(requesterId, addresseeId);
      res.json(friendship);
    } catch (error) {
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.post("/api/friends/accept/:id", async (req, res) => {
    try {
      const friendship = await storage.acceptFriendRequest(parseInt(req.params.id));
      res.json(friendship);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept friend request" });
    }
  });

  app.get("/api/users/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }

      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  app.get("/api/user/:id/friends", async (req, res) => {
    try {
      const friends = await storage.getFriends(req.params.id);
      res.json(friends);
    } catch (error) {
      res.status(500).json({ message: "Failed to get friends" });
    }
  });

  app.get("/api/user/:id/friend-requests", async (req, res) => {
    try {
      const requests = await storage.getFriendRequests(req.params.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get friend requests" });
    }
  });

  // Posts and Feed
  app.post("/api/posts", async (req, res) => {
    try {
      const post = await storage.createPost(req.body);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/user/:id/feed", async (req, res) => {
    try {
      const posts = await storage.getFeedPosts(req.params.id);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get feed" });
    }
  });

  app.get("/api/user/:id/posts", async (req, res) => {
    try {
      const posts = await storage.getUserPosts(req.params.id);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user posts" });
    }
  });

  app.post("/api/posts/:id/like", async (req, res) => {
    try {
      const { userId } = req.body;
      const like = await storage.likePost(userId, parseInt(req.params.id));
      res.json(like);
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete("/api/posts/:id/like", async (req, res) => {
    try {
      const { userId } = req.body;
      const success = await storage.unlikePost(userId, parseInt(req.params.id));
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.post("/api/posts/:id/comment", async (req, res) => {
    try {
      const { userId, content } = req.body;
      const comment = await storage.commentOnPost(userId, parseInt(req.params.id), content);
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Spot Reviews
  app.post("/api/spots/:id/review", async (req, res) => {
    try {
      const spotId = parseInt(req.params.id);
      const review = await storage.createSpotReview({ ...req.body, spotId });
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get("/api/spots/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getSpotReviews(parseInt(req.params.id));
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reviews" });
    }
  });

  app.get("/api/user/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getUserReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user reviews" });
    }
  });

  // Push Notifications API
  app.get("/api/user/:id/notifications", async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.params.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(parseInt(req.params.id));
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/user/:id/push-settings", async (req, res) => {
    try {
      const user = await storage.updateUserPushSettings(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update push settings" });
    }
  });

  // Location tracking for push notifications
  app.post("/api/user/:id/track-location", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      const userId = req.params.id;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      // Track user location in notification service
      await notificationService.trackUserLocation(userId, latitude, longitude);
      
      res.json({ 
        message: "Location tracked successfully", 
        activeUsers: notificationService.getActiveUsersCount()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to track location" });
    }
  });

  // Get notification service status
  app.get("/api/notifications/status", async (req, res) => {
    try {
      const history = await notificationService.getNotificationHistory();
      res.json({
        isRunning: true,
        activeUsers: notificationService.getActiveUsersCount(),
        message: "Push notification service is running",
        notificationsSent: history.sent,
        notificationsPending: history.pending
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get notification status" });
    }
  });

  // Enhanced test endpoint for nearby trendy spot notifications
  app.post('/api/test-nearby', async (req, res) => {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    try {
      const userId = "1"; // Guest user
      
      // Track location and immediately check for nearby trending spots
      await notificationService.trackUserLocation(userId, latitude, longitude);
      await notificationService.checkNearbyTrendySpots(userId, latitude, longitude);
      
      // Get recent notifications created in the last 5 minutes
      const recentNotifications = await storage.getUserNotifications(userId);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const newNotifications = recentNotifications.filter(n => 
        n.createdAt && new Date(n.createdAt) > fiveMinutesAgo
      );
      
      // Send WebSocket notification for any new nearby trending spots
      if (newNotifications.length > 0) {
        for (const notification of newNotifications) {
          if (notification.type === 'nearby_trending') {
            // Broadcast to connected WebSocket clients
            const connections = activeConnections.get(userId);
            if (connections && connections.readyState === WebSocket.OPEN) {
              connections.send(JSON.stringify({
                type: 'trending_spot_notification',
                notification: notification,
                timestamp: new Date().toISOString()
              }));
            }
          }
        }
      }
      
      res.json({
        message: 'Location tracked and checked for trending spots',
        status: 'tracking',
        coordinates: { latitude, longitude },
        newNotifications: newNotifications.length,
        notifications: newNotifications
      });
    } catch (error) {
      console.error('Error checking nearby trendy spots:', error);
      res.status(500).json({ message: 'Failed to check nearby spots' });
    }
  });

  // Manual trigger for testing nearby spot notifications
  app.post("/api/notifications/test-nearby", async (req, res) => {
    try {
      const { userId, latitude, longitude } = req.body;
      
      if (!userId || !latitude || !longitude) {
        return res.status(400).json({ message: "userId, latitude, and longitude are required" });
      }
      
      // Temporarily track user and trigger immediate check
      await notificationService.trackUserLocation(userId, latitude, longitude);
      
      res.json({ message: "Test notification check initiated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to test notifications" });
    }
  });

  // Squad competition routes
  app.post("/api/squads", async (req, res) => {
    try {
      const squad = await storage.createSquad(req.body);
      res.json(squad);
    } catch (error) {
      console.error("Error creating squad:", error);
      res.status(500).json({ error: "Failed to create squad" });
    }
  });

  app.get("/api/user/:userId/squads", async (req, res) => {
    try {
      const userId = req.params.userId;
      const squads = await storage.getUserSquads(userId);
      res.json(squads);
    } catch (error) {
      console.error("Error fetching user squads:", error);
      res.status(500).json({ error: "Failed to fetch squads" });
    }
  });

  app.post("/api/squads/:squadId/join", async (req, res) => {
    try {
      const squadId = parseInt(req.params.squadId);
      const { userId } = req.body;
      const member = await storage.joinSquad(squadId, userId);
      res.json(member);
    } catch (error) {
      console.error("Error joining squad:", error);
      res.status(400).json({ error: (error as Error).message || "Failed to join squad" });
    }
  });

  app.get("/api/squads/:squadId/members", async (req, res) => {
    try {
      const squadId = parseInt(req.params.squadId);
      const members = await storage.getSquadMembers(squadId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching squad members:", error);
      res.status(500).json({ error: "Failed to fetch squad members" });
    }
  });

  app.get("/api/squads/city/:city/:country", async (req, res) => {
    try {
      const { city, country } = req.params;
      const squads = await storage.getSquadsByCity(city, country);
      res.json(squads);
    } catch (error) {
      console.error("Error fetching city squads:", error);
      res.status(500).json({ error: "Failed to fetch city squads" });
    }
  });

  // Group challenges routes
  app.post("/api/group-challenges", async (req, res) => {
    try {
      const challenge = await storage.createGroupChallenge(req.body);
      res.json(challenge);
    } catch (error) {
      console.error("Error creating group challenge:", error);
      res.status(500).json({ error: "Failed to create challenge" });
    }
  });

  app.get("/api/group-challenges", async (req, res) => {
    try {
      const { city, country } = req.query;
      const challenges = await storage.getActiveGroupChallenges(city as string, country as string);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching group challenges:", error);
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  app.post("/api/group-challenges/:challengeId/join", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      const { participantId, participantType } = req.body;
      const participant = await storage.joinGroupChallenge(challengeId, participantId, participantType);
      res.json(participant);
    } catch (error) {
      console.error("Error joining challenge:", error);
      res.status(500).json({ error: "Failed to join challenge" });
    }
  });

  app.get("/api/group-challenges/:challengeId/leaderboard", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      const leaderboard = await storage.getChallengeLeaderboard(challengeId);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching challenge leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // City leaderboards routes
  app.get("/api/leaderboards/:city/:country", async (req, res) => {
    try {
      const { city, country } = req.params;
      const { period = 'weekly', type = 'individual' } = req.query;
      const leaderboard = await storage.getCityLeaderboard(city, country, period as any, type as any);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching city leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket setup for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections by user ID
  const activeConnections = new Map<string, WebSocket>();
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');
    
    // Store user connection when they authenticate
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'authenticate') {
          const userId = data.userId;
          if (userId) {
            activeConnections.set(userId, ws);
            console.log(`User ${userId} authenticated via WebSocket`);
            
            // Send confirmation
            ws.send(JSON.stringify({
              type: 'authenticated',
              userId: userId
            }));
            
            // Broadcast to friends that this user is now online
            broadcastToFriends(userId, {
              type: 'friend_online',
              userId: userId,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        if (data.type === 'location_update') {
          const { userId, latitude, longitude } = data;
          if (userId && latitude && longitude) {
            // Check for nearby friends and notify them
            notifyNearbyFriends(userId, latitude, longitude);
          }
        }
        
        // Handle spots request via WebSocket for iOS compatibility
        if (data.type === 'getSpotsNearby') {
          try {
            console.log(`WebSocket spots request for ${data.latitude}, ${data.longitude}`);
            
            const spots = await findNearbySpots(data.latitude, data.longitude, {
              radius: data.radius || 1000,
              limit: data.limit || 20,
              category: data.filters?.category,
              search: data.filters?.search,
              dietary: data.filters?.dietary,
              price: data.filters?.price,
              ambiance: data.filters?.ambiance
            });
            
            console.log(`WebSocket returning ${spots.length} spots to client`);
            
            ws.send(JSON.stringify({
              type: 'spotsNearbyResponse',
              requestId: data.requestId,
              spots: spots
            }));
          } catch (error) {
            console.error('WebSocket spots error:', error);
            ws.send(JSON.stringify({
              type: 'spotsNearbyResponse',
              requestId: data.requestId,
              error: error.message
            }));
          }
        }
        
        if (data.type === 'spot_hunt') {
          const { userId, spotId, points, badge } = data;
          if (userId) {
            // Broadcast to friends about this spot hunt
            broadcastToFriends(userId, {
              type: 'friend_activity',
              activity: {
                userId,
                type: 'spot_hunt',
                spotId,
                points,
                badge,
                timestamp: new Date().toISOString()
              }
            });
          }
        }
        
        if (data.type === 'squad_challenge_complete') {
          const { userId, challengeId, squadId } = data;
          if (userId && squadId) {
            // Broadcast to squad members about challenge completion
            broadcastToSquadMembers(squadId, {
              type: 'squad_activity',
              activity: {
                userId,
                type: 'challenge_complete',
                challengeId,
                timestamp: new Date().toISOString()
              }
            });
          }
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove connection when user disconnects
      for (const [userId, connection] of Array.from(activeConnections.entries())) {
        if (connection === ws) {
          activeConnections.delete(userId);
          console.log(`User ${userId} disconnected`);
          
          // Broadcast to friends that this user is now offline
          broadcastToFriends(userId, {
            type: 'friend_offline',
            userId: userId,
            timestamp: new Date().toISOString()
          });
          break;
        }
      }
    });
  });
  
  // Helper function to broadcast messages to user's friends
  async function broadcastToFriends(userId: string, message: any) {
    try {
      const friends = await storage.getUserFriends(userId);
      for (const friend of friends) {
        const friendConnection = activeConnections.get(friend.id.toString());
        if (friendConnection && friendConnection.readyState === WebSocket.OPEN) {
          friendConnection.send(JSON.stringify(message));
        }
      }
    } catch (error) {
      console.error('Error broadcasting to friends:', error);
    }
  }
  
  // Helper function to broadcast to squad members
  async function broadcastToSquadMembers(squadId: number, message: any) {
    try {
      const squadMembers = await storage.getSquadMembers(squadId);
      for (const member of squadMembers) {
        const memberConnection = activeConnections.get(member.userId);
        if (memberConnection && memberConnection.readyState === WebSocket.OPEN) {
          memberConnection.send(JSON.stringify(message));
        }
      }
    } catch (error) {
      console.error('Error broadcasting to squad members:', error);
    }
  }
  
  // Helper function to notify nearby friends
  async function notifyNearbyFriends(userId: string, latitude: number, longitude: number) {
    try {
      const friends = await storage.getUserFriends(userId);
      for (const friend of friends) {
        const friendConnection = activeConnections.get(friend.id.toString());
        if (friendConnection && friendConnection.readyState === WebSocket.OPEN) {
          // Calculate distance and notify if within 500m
          // This would need friend's last known location - simplified for now
          friendConnection.send(JSON.stringify({
            type: 'friend_nearby',
            friendId: userId,
            latitude: latitude,
            longitude: longitude,
            message: `Your friend is nearby! Perfect time to hunt spots together 👯‍♀️`,
            timestamp: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      console.error('Error notifying nearby friends:', error);
    }
  }
  
  // Stories endpoints
  app.get("/api/stories", async (req, res) => {
    try {
      const stories = await storage.getActiveStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.post("/api/stories", async (req, res) => {
    try {
      const storyData = {
        ...req.body,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      };
      const story = await storage.createStory(storyData);
      res.json(story);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  return httpServer;
}
