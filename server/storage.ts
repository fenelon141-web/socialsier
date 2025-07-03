import { 
  users, spots, badges, userBadges, spotHunts, dailyChallenges, 
  userChallengeProgress, rewards,
  type User, type InsertUser, type Spot, type InsertSpot, 
  type Badge, type InsertBadge, type UserBadge, type SpotHunt, 
  type InsertSpotHunt, type DailyChallenge, type UserChallengeProgress,
  type Reward, type InsertReward
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Spots
  getAllSpots(): Promise<Spot[]>;
  getTrendingSpots(): Promise<Spot[]>;
  getSpot(id: number): Promise<Spot | undefined>;
  createSpot(spot: InsertSpot): Promise<Spot>;
  huntSpot(userId: number, spotId: number): Promise<SpotHunt>;

  // Badges
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: number, badgeId: number): Promise<UserBadge>;

  // Daily Challenges
  getActiveChallenges(): Promise<DailyChallenge[]>;
  getUserChallengeProgress(userId: number): Promise<(UserChallengeProgress & { challenge: DailyChallenge })[]>;
  updateChallengeProgress(userId: number, challengeId: number, progress: number): Promise<UserChallengeProgress>;

  // Rewards
  getAvailableRewards(userId: number): Promise<Reward[]>;
  claimReward(userId: number, rewardId: number): Promise<boolean>;

  // Activity Feed
  getRecentActivity(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private spots: Map<number, Spot> = new Map();
  private badges: Map<number, Badge> = new Map();
  private userBadges: Map<number, UserBadge> = new Map();
  private spotHunts: Map<number, SpotHunt> = new Map();
  private dailyChallenges: Map<number, DailyChallenge> = new Map();
  private userChallengeProgress: Map<number, UserChallengeProgress> = new Map();
  private rewards: Map<number, Reward> = new Map();
  
  private currentUserId = 1;
  private currentSpotId = 1;
  private currentBadgeId = 1;
  private currentUserBadgeId = 1;
  private currentSpotHuntId = 1;
  private currentChallengeId = 1;
  private currentProgressId = 1;
  private currentRewardId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed users
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "ValleyGirl123",
      email: "valley@example.com",
      level: 8,
      totalPoints: 2300,
      spotsHunted: 127,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      createdAt: new Date()
    };
    this.users.set(defaultUser.id, defaultUser);

    // Seed spots
    const mockSpots: Omit<Spot, 'id'>[] = [
      {
        name: "Oat Milk Dreams ☁️",
        description: "Literally the cutest matcha spot 💚",
        category: "cafe",
        latitude: 34.0736,
        longitude: -118.4004,
        address: "123 Beverly Hills Blvd",
        rating: 4.9,
        huntCount: 127,
        imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400",
        trending: true,
        createdAt: new Date()
      },
      {
        name: "Purple Vibes Bowls 🍇",
        description: "Obsessed with their lavender bowls!! 💜",
        category: "bowl",
        latitude: 34.0722,
        longitude: -118.3998,
        address: "456 Aesthetic Ave",
        rating: 4.8,
        huntCount: 89,
        imageUrl: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400",
        trending: true,
        createdAt: new Date()
      },
      {
        name: "Golden Hour Coffee ☕",
        description: "Pink lattes that taste like heaven 🌸",
        category: "coffee",
        latitude: 34.0728,
        longitude: -118.4012,
        address: "789 Trendy St",
        rating: 4.7,
        huntCount: 156,
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400",
        trending: true,
        createdAt: new Date()
      },
      {
        name: "Kombucha Vibes 🫧",
        description: "The most aesthetic fermented drinks ever!",
        category: "kombucha",
        latitude: 34.0742,
        longitude: -118.4020,
        address: "321 Wellness Way",
        rating: 4.6,
        huntCount: 73,
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400",
        trending: false,
        createdAt: new Date()
      },
      {
        name: "Avocado Toast Central 🥑",
        description: "Instagram-worthy avo toast that's actually good",
        category: "brunch",
        latitude: 34.0715,
        longitude: -118.3985,
        address: "654 Millennial Blvd",
        rating: 4.8,
        huntCount: 234,
        imageUrl: "https://images.unsplash.com/photo-1603046891744-432d9b8a5689?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400",
        trending: false,
        createdAt: new Date()
      }
    ];

    mockSpots.forEach(spot => {
      const fullSpot: Spot = { ...spot, id: this.currentSpotId++ };
      this.spots.set(fullSpot.id, fullSpot);
    });

    // Seed badges
    const mockBadges: Omit<Badge, 'id'>[] = [
      { name: "Boba Queen", description: "Hunt 5 boba spots", emoji: "🧋", category: "drinks", requirement: "5_boba_spots", rarity: "common" },
      { name: "Avo Lover", description: "Check in at 10 avocado spots", emoji: "🥑", category: "food", requirement: "10_avocado_spots", rarity: "common" },
      { name: "Pink Vibes", description: "Find 3 pink aesthetic spots", emoji: "🌸", category: "aesthetic", requirement: "3_pink_spots", rarity: "rare" },
      { name: "Latte Art", description: "Hunt 15 coffee spots", emoji: "☕", category: "coffee", requirement: "15_coffee_spots", rarity: "common" },
      { name: "Kombucha Queen", description: "Master of fermented drinks", emoji: "👑", category: "drinks", requirement: "kombucha_master", rarity: "epic" },
      { name: "Matcha Master", description: "Expert matcha hunter", emoji: "🍵", category: "drinks", requirement: "matcha_expert", rarity: "rare" },
      { name: "Bowl Boss", description: "Acai bowl enthusiast", emoji: "🍇", category: "food", requirement: "bowl_lover", rarity: "common" }
    ];

    mockBadges.forEach(badge => {
      const fullBadge: Badge = { ...badge, id: this.currentBadgeId++ };
      this.badges.set(fullBadge.id, fullBadge);
    });

    // Seed user badges (recent achievements)
    const recentBadges = [1, 2, 3, 4]; // Badge IDs
    recentBadges.forEach((badgeId, index) => {
      const userBadge: UserBadge = {
        id: this.currentUserBadgeId++,
        userId: 1,
        badgeId,
        earnedAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)) // Last few days
      };
      this.userBadges.set(userBadge.id, userBadge);
    });

    // Seed daily challenges
    const challenge: DailyChallenge = {
      id: this.currentChallengeId++,
      title: "Find 3 aesthetic matcha spots!",
      description: "Hunt down the trendiest matcha cafes in your area",
      requirement: "3_matcha_spots",
      reward: 150,
      emoji: "💫",
      active: true,
      date: new Date()
    };
    this.dailyChallenges.set(challenge.id, challenge);

    // Seed challenge progress
    const progress: UserChallengeProgress = {
      id: this.currentProgressId++,
      userId: 1,
      challengeId: 1,
      progress: 2,
      completed: false,
      completedAt: null
    };
    this.userChallengeProgress.set(progress.id, progress);

    // Seed rewards
    const mockRewards: Omit<Reward, 'id'>[] = [
      {
        spotId: 1,
        title: "50% off matcha lattes",
        description: "Limited time offer at Oat Milk Dreams",
        discountPercent: 50,
        promoCode: "MATCHA50",
        active: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        spotId: 2,
        title: "Buy one, get one free",
        description: "BOGO bowls at Purple Vibes",
        discountPercent: null,
        promoCode: "BOGO2024",
        active: true,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      }
    ];

    mockRewards.forEach(reward => {
      const fullReward: Reward = { ...reward, id: this.currentRewardId++ };
      this.rewards.set(fullReward.id, fullReward);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.currentUserId++,
      createdAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllSpots(): Promise<Spot[]> {
    return Array.from(this.spots.values());
  }

  async getTrendingSpots(): Promise<Spot[]> {
    return Array.from(this.spots.values()).filter(spot => spot.trending);
  }

  async getSpot(id: number): Promise<Spot | undefined> {
    return this.spots.get(id);
  }

  async createSpot(spot: InsertSpot): Promise<Spot> {
    const newSpot: Spot = {
      ...spot,
      id: this.currentSpotId++,
      createdAt: new Date()
    };
    this.spots.set(newSpot.id, newSpot);
    return newSpot;
  }

  async huntSpot(userId: number, spotId: number): Promise<SpotHunt> {
    const spotHunt: SpotHunt = {
      id: this.currentSpotHuntId++,
      userId,
      spotId,
      pointsEarned: 50,
      huntedAt: new Date()
    };
    this.spotHunts.set(spotHunt.id, spotHunt);

    // Update user stats
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        totalPoints: user.totalPoints + 50,
        spotsHunted: user.spotsHunted + 1
      };
      this.users.set(userId, updatedUser);
    }

    // Update spot hunt count
    const spot = this.spots.get(spotId);
    if (spot) {
      const updatedSpot = {
        ...spot,
        huntCount: spot.huntCount + 1
      };
      this.spots.set(spotId, updatedSpot);
    }

    return spotHunt;
  }

  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    const userBadges = Array.from(this.userBadges.values()).filter(ub => ub.userId === userId);
    return userBadges.map(ub => ({
      ...ub,
      badge: this.badges.get(ub.badgeId)!
    })).filter(ub => ub.badge);
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    const userBadge: UserBadge = {
      id: this.currentUserBadgeId++,
      userId,
      badgeId,
      earnedAt: new Date()
    };
    this.userBadges.set(userBadge.id, userBadge);
    return userBadge;
  }

  async getActiveChallenges(): Promise<DailyChallenge[]> {
    return Array.from(this.dailyChallenges.values()).filter(c => c.active);
  }

  async getUserChallengeProgress(userId: number): Promise<(UserChallengeProgress & { challenge: DailyChallenge })[]> {
    const progress = Array.from(this.userChallengeProgress.values()).filter(p => p.userId === userId);
    return progress.map(p => ({
      ...p,
      challenge: this.dailyChallenges.get(p.challengeId)!
    })).filter(p => p.challenge);
  }

  async updateChallengeProgress(userId: number, challengeId: number, progress: number): Promise<UserChallengeProgress> {
    const existing = Array.from(this.userChallengeProgress.values())
      .find(p => p.userId === userId && p.challengeId === challengeId);
    
    if (existing) {
      existing.progress = progress;
      if (progress >= 3) { // Assuming requirement is 3 for the demo challenge
        existing.completed = true;
        existing.completedAt = new Date();
      }
      return existing;
    }

    const newProgress: UserChallengeProgress = {
      id: this.currentProgressId++,
      userId,
      challengeId,
      progress,
      completed: progress >= 3,
      completedAt: progress >= 3 ? new Date() : null
    };
    this.userChallengeProgress.set(newProgress.id, newProgress);
    return newProgress;
  }

  async getAvailableRewards(userId: number): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(r => r.active);
  }

  async claimReward(userId: number, rewardId: number): Promise<boolean> {
    const reward = this.rewards.get(rewardId);
    if (!reward || !reward.active) return false;
    
    // In a real app, you'd track claimed rewards per user
    return true;
  }

  async getRecentActivity(): Promise<any[]> {
    // Mock friends activity
    return [
      {
        id: 1,
        friend: { name: "Madison", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" },
        action: "hunted a new spot!",
        timestamp: "2 mins ago",
        points: 50
      },
      {
        id: 2,
        friend: { name: "Chloe", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" },
        action: 'earned the "Kombucha Queen" badge!',
        timestamp: "15 mins ago",
        badge: true
      }
    ];
  }
}

export const storage = new MemStorage();
