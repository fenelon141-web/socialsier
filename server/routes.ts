import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSpotHuntSchema } from "@shared/schema";

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
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const spotHunt = await storage.huntSpot(userId, spotId);
      
      // Update challenge progress for matcha spots
      const spot = await storage.getSpot(spotId);
      if (spot && spot.category === 'cafe') {
        await storage.updateChallengeProgress(userId, 1, 2); // Update to current progress
      }

      res.json(spotHunt);
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
