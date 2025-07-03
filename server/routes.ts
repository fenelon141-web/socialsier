import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSpotHuntSchema } from "@shared/schema";

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
    // Use Overpass API to find trendy, aesthetic spots (exclude fast food)
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"^(cafe|restaurant|juice_bar)$"](around:${radius},${lat},${lng});
        way["amenity"~"^(cafe|restaurant|juice_bar)$"](around:${radius},${lat},${lng});
        relation["amenity"~"^(cafe|restaurant|juice_bar)$"](around:${radius},${lat},${lng});
        node["shop"~"^(coffee|tea|health_food|organic|bakery)$"](around:${radius},${lat},${lng});
        way["shop"~"^(coffee|tea|health_food|organic|bakery)$"](around:${radius},${lat},${lng});
        node["cuisine"~"^(coffee_shop|bubble_tea|vegan|vegetarian|healthy)$"](around:${radius},${lat},${lng});
        way["cuisine"~"^(coffee_shop|bubble_tea|vegan|vegetarian|healthy)$"](around:${radius},${lat},${lng});
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
    return sortByTrendiness(uniqueResults).slice(0, 25);

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
  
  // Generate a consistent but varied rating based on name and type
  const nameHash = (tags.name || '').split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
  const rating = 3.5 + ((nameHash % 20) / 40); // Range: 3.5 - 4.0
  
  return {
    id: element.id || Math.random().toString(),
    name: tags.name || 'Local Spot',
    description: getOSMDescription(tags),
    latitude: placeLat,
    longitude: placeLng,
    rating: Math.round(rating * 10) / 10,
    imageUrl: getAestheticImageUrl(tags),
    category: getOSMCategory(tags.amenity),
    trending: rating >= 3.8,
    huntCount: Math.floor(Math.random() * 30) + 5,
    distance: Math.round(distance),
    amenity: tags.amenity,
    cuisine: tags.cuisine,
    website: tags.website,
    phone: tags.phone
  };
}

function getOSMDescription(tags: any): string {
  const amenity = tags.amenity || '';
  const cuisine = tags.cuisine || '';
  const shop = tags.shop || '';
  const name = (tags.name || '').toLowerCase();
  
  let description = '';
  
  // Specific trendy drink spots
  if (name.includes('matcha') || cuisine === 'bubble_tea' || shop === 'tea') {
    description = '🍵 Aesthetic matcha lattes & boba tea';
  } else if (name.includes('juice') || amenity === 'juice_bar') {
    description = '🥤 Cold-pressed juices & smoothie bowls';
  } else if (name.includes('coffee') || amenity === 'cafe') {
    description = '☕ Iced lattes with oat milk & aesthetic vibes';
  } else if (shop === 'bakery' || name.includes('bakery')) {
    description = '🥐 Artisan pastries & Instagram-worthy treats';
  } else if (cuisine === 'vegan' || name.includes('vegan')) {
    description = '🌱 Plant-based açaí bowls & avocado toast';
  } else if (cuisine === 'healthy' || name.includes('bowl')) {
    description = '🥗 Poke bowls, quinoa salads & buddha bowls';
  } else if (amenity === 'restaurant' && cuisine) {
    // Specific cuisine types
    if (cuisine === 'japanese') {
      description = '🍣 Aesthetic sushi & poke bowls';
    } else if (cuisine === 'italian') {
      description = '🍝 Cauliflower crust pizza & fresh pasta';
    } else if (cuisine === 'mexican') {
      description = '🌮 Fresh guac & colorful veggie bowls';
    } else {
      description = `🍽️ Trendy ${cuisine} with Instagram appeal`;
    }
  } else if (amenity === 'restaurant') {
    description = '🍽️ Aesthetic dining & photogenic plates';
  } else {
    description = '✨ Trendy spot perfect for your feed';
  }
  
  // Add special tags
  if (tags.organic === 'yes') description += ' • Organic';
  if (tags.fair_trade === 'yes') description += ' • Fair Trade';
  if (tags.vegan === 'yes' || tags.diet_vegan === 'yes') description += ' • Vegan';
  if (tags.gluten_free === 'yes') description += ' • Gluten Free';
  
  return description;
}

function getAestheticImageUrl(tags: any): string {
  const amenity = tags.amenity || '';
  const cuisine = tags.cuisine || '';
  const shop = tags.shop || '';
  const name = (tags.name || '').toLowerCase();
  
  // Specific trendy aesthetic images
  if (name.includes('matcha') || shop === 'tea') {
    return 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'; // Matcha latte
  }
  if (name.includes('boba') || name.includes('bubble') || cuisine === 'bubble_tea') {
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'; // Boba tea
  }
  if (name.includes('juice') || amenity === 'juice_bar') {
    return 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'; // Smoothie bowls
  }
  if (name.includes('acai') || name.includes('bowl')) {
    return 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'; // Açaí bowl
  }
  if (name.includes('avocado') || name.includes('toast')) {
    return 'https://images.unsplash.com/photo-1541519869999-d5348ee78465?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'; // Avocado toast
  }
  if (name.includes('poke')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'; // Poke bowl
  }
  if (shop === 'bakery' || name.includes('bakery')) {
    return 'https://images.unsplash.com/photo-1558618666-f87056e94e83?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'; // Pastries
  }
  
  // Cuisine-specific trendy images
  if (cuisine === 'vegan') {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'; // Vegan salad
  }
  if (cuisine === 'japanese') {
    return 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'; // Aesthetic sushi
  }
  if (cuisine === 'healthy') {
    return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'; // Healthy bowl
  }
  
  // Default aesthetic images by type
  const imageMap: { [key: string]: string } = {
    'cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', // Coffee shop
    'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', // Restaurant
    'juice_bar': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' // Juice bar
  };
  
  return imageMap[amenity] || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
}

function getOSMCategory(amenity: string): string {
  const categoryMap: { [key: string]: string } = {
    'cafe': 'coffee',
    'restaurant': 'restaurant',
    'fast_food': 'fast_food',
    'bar': 'bar',
    'pub': 'bar'
  };
  
  return categoryMap[amenity] || 'food';
}

function isTrendyPlace(place: any): boolean {
  const name = place.name?.toLowerCase() || '';
  const amenity = place.amenity?.toLowerCase() || '';
  const shop = place.shop?.toLowerCase() || '';
  const cuisine = place.cuisine?.toLowerCase() || '';
  
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
    'cute', 'cozy', 'chic', 'modern', 'minimalist', 'rustic'
  ];

  const trendyTypes = [
    'cafe', 'coffee', 'juice_bar', 'health_food', 'organic',
    'bakery', 'tea', 'bubble_tea', 'vegan', 'vegetarian'
  ];

  const hasTrendyKeyword = trendyKeywords.some(keyword => 
    name.includes(keyword)
  );

  const hasTrendyAmenity = amenity === 'cafe' || amenity === 'juice_bar';
  const hasTrendyShop = trendyTypes.includes(shop);
  const hasTrendyCuisine = ['vegan', 'vegetarian', 'healthy', 'bubble_tea', 'coffee_shop'].includes(cuisine);
  
  // For restaurants, be more selective
  if (amenity === 'restaurant') {
    return hasTrendyKeyword || hasTrendyCuisine;
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
  const aestheticImages = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  ];
  
  const imageIndex = (place.place_id || place.name || '').length % aestheticImages.length;
  return aestheticImages[imageIndex];
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
    const spots = await storage.getGymClasses();
    res.json(spots);
  });

  // Get nearby spots based on user location using OpenStreetMap
  app.get("/api/spots/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 2000 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const searchRadius = parseInt(radius as string);
      
      // Use OpenStreetMap to find nearby trendy spots (completely free)
      const nearbySpots = await findNearbyTrendySpots(userLat, userLng, searchRadius);
      
      if (nearbySpots.length === 0) {
        // Fallback to stored spots if OSM returns no results
        const allSpots = await storage.getAllSpots();
        const fallbackSpots = allSpots
          .map(spot => ({
            ...spot,
            distance: calculateDistance(userLat, userLng, spot.latitude, spot.longitude)
          }))
          .filter(spot => spot.distance <= searchRadius)
          .sort((a, b) => a.distance - b.distance);
        
        return res.json(fallbackSpots);
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
      const { userId, userLatitude, userLongitude } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Validate location data
      if (!userLatitude || !userLongitude) {
        return res.status(400).json({ message: "Location data required for check-in" });
      }
      
      // Get spot details to verify location
      const spot = await storage.getSpot(spotId);
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

      const spotHunt = await storage.huntSpot(userId, spotId);
      
      // Update challenge progress for matcha spots
      if (spot && spot.category === 'cafe') {
        await storage.updateChallengeProgress(userId, 1, 2); // Update to current progress
      }

      res.json({ 
        ...spotHunt, 
        distance: Math.round(distance),
        verified: true 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to hunt spot" });
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

  const httpServer = createServer(app);
  return httpServer;
}
