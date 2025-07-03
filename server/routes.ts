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

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Get nearby spots based on user location
  app.get("/api/spots/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 1000 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxRadius = parseInt(radius as string);
      
      const allSpots = await storage.getAllSpots();
      
      // Filter spots by proximity and add distance
      const nearbySpots = allSpots
        .map(spot => ({
          ...spot,
          distance: calculateDistance(userLat, userLng, spot.latitude, spot.longitude)
        }))
        .filter(spot => spot.distance <= maxRadius)
        .sort((a, b) => a.distance - b.distance);
      
      res.json(nearbySpots);
    } catch (error) {
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
