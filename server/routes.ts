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

async function findNearbyTrendySpots(lat: number, lng: number, radius: number, apiKey: string) {
  const trendyTypes = ['restaurant', 'cafe', 'coffee_shop', 'bakery', 'meal_takeaway'];
  const allResults: any[] = [];

  for (const type of trendyTypes) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${lat},${lng}&radius=${radius}&type=${type}&` +
        `key=${apiKey}&fields=place_id,name,geometry,rating,price_level,types,photos,vicinity,business_status`
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.results) {
        const trendyResults = data.results.filter((place: any) => {
          const isTrendy = isTrendyPlace(place);
          const hasGoodRating = !place.rating || place.rating >= 4.0;
          const isOpen = place.business_status === 'OPERATIONAL' || !place.business_status;
          
          return isTrendy && hasGoodRating && isOpen;
        });

        allResults.push(...trendyResults);
      }
    } catch (error) {
      console.warn(`Failed to search for ${type}:`, error);
    }
  }

  const uniqueResults = removeDuplicates(allResults);
  const spots = uniqueResults.map(place => convertGooglePlaceToSpot(place, lat, lng));
  
  return sortByTrendiness(spots).slice(0, 25);
}

function isTrendyPlace(place: any): boolean {
  const name = place.name?.toLowerCase() || '';
  const types = (place.types || []).join(' ').toLowerCase();
  
  const trendyKeywords = [
    'artisan', 'craft', 'organic', 'local', 'farm', 'fresh',
    'boutique', 'specialty', 'gourmet', 'matcha', 'acai',
    'juice', 'smoothie', 'avocado', 'toast', 'bowl',
    'brunch', 'aesthetic', 'instagrammable', 'cute',
    'cozy', 'chic', 'modern', 'contemporary'
  ];

  const trendyTypes = [
    'juice_bar', 'health_food', 'organic_food',
    'coffee_shop', 'cafe', 'bakery'
  ];

  const hasTrendyKeyword = trendyKeywords.some(keyword => 
    name.includes(keyword) || types.includes(keyword)
  );

  const hasTrendyType = trendyTypes.some(type => types.includes(type));
  const hasHighRating = place.rating && place.rating >= 4.2;

  return hasTrendyKeyword || hasTrendyType || hasHighRating;
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

  // Get nearby spots based on user location using Google Places API
  app.get("/api/spots/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 2000 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const searchRadius = parseInt(radius as string);
      
      // Get Google Places API key
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        // Fallback to stored spots
        const allSpots = await storage.getAllSpots();
        const nearbySpots = allSpots
          .map(spot => ({
            ...spot,
            distance: calculateDistance(userLat, userLng, spot.latitude, spot.longitude)
          }))
          .filter(spot => spot.distance <= searchRadius)
          .sort((a, b) => a.distance - b.distance);
        
        return res.json(nearbySpots);
      }

      // Use Google Places API to find trendy spots
      const nearbySpots = await findNearbyTrendySpots(userLat, userLng, searchRadius, apiKey);
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
