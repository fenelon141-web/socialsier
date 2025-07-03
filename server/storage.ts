import { 
  type User, type InsertUser, type Spot, type InsertSpot, 
  type Badge, type UserBadge, type SpotHunt, type DailyChallenge, 
  type UserChallengeProgress, type Reward
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
  getGymClasses(): Promise<Spot[]>;
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

class MemStorage implements IStorage {
  private users: User[] = [
    {
      id: 1,
      username: "valley_girl",
      email: "test@example.com",
      level: 1,
      totalPoints: 0,
      spotsHunted: 0,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
      createdAt: new Date()
    }
  ];

  private spots: Spot[] = [
    {
      id: 1,
      name: "Zen Garden Café",
      createdAt: new Date(),
      description: "Aesthetic minimalist café serving iced matcha lattes with oat milk foam art and fresh açaí bowls topped with edible flowers",
      category: "café",
      latitude: 37.7749,
      longitude: -122.4194,
      address: "123 Trendy Street, San Francisco, CA",
      rating: 4.8,
      huntCount: 45,
      imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
      trending: true
    },
    {
      id: 2,
      name: "Pure Barre Paradise",
      createdAt: new Date(),
      description: "Boutique fitness studio with Instagram-worthy pink walls and motivational neon signs",
      category: "gym",
      latitude: 37.7849,
      longitude: -122.4094,
      address: "456 Wellness Way, San Francisco, CA",
      rating: 4.9,
      huntCount: 78,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      trending: true
    },
    {
      id: 3,
      name: "Boba Bliss",
      createdAt: new Date(),
      description: "Trendy boba tea shop with aesthetic pastel colors and Instagrammable drink presentations",
      category: "café",
      latitude: 37.7649,
      longitude: -122.4294,
      address: "789 Aesthetic Ave, San Francisco, CA",
      rating: 4.7,
      huntCount: 32,
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      trending: true
    }
  ];

  private badges: Badge[] = [
    {
      id: 1,
      name: "Matcha Maven",
      description: "Hunt 5 matcha spots",
      category: "food",
      emoji: "🍵",
      requirement: "Visit 5 different matcha-serving locations",
      rarity: "common"
    },
    {
      id: 2,
      name: "Workout Warrior",
      description: "Complete 10 gym check-ins",
      category: "fitness",
      emoji: "💪",
      requirement: "Check in to 10 different fitness studios",
      rarity: "rare"
    },
    {
      id: 3,
      name: "Boba Babe",
      description: "Try boba at 3 different spots",
      category: "drinks",
      emoji: "🧋",
      requirement: "Visit 3 different boba tea locations",
      rarity: "common"
    }
  ];

  private userBadges: UserBadge[] = [];
  private spotHunts: SpotHunt[] = [];

  private dailyChallenges: DailyChallenge[] = [
    {
      id: 1,
      title: "Matcha Monday",
      description: "Hunt 3 matcha spots today",
      targetCount: 3,
      pointsReward: 50,
      badgeReward: null,
      active: true,
      date: new Date()
    }
  ];

  private userChallengeProgress: UserChallengeProgress[] = [];

  private rewards: Reward[] = [
    {
      id: 1,
      title: "Free Matcha Latte",
      description: "Redeem at partner cafés",
      pointsCost: 100,
      type: "discount",
      active: true
    }
  ];

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.users.length + 1,
      username: insertUser.username!,
      email: insertUser.email!,
      level: insertUser.level || 1,
      totalPoints: insertUser.totalPoints || 0,
      spotsHunted: insertUser.spotsHunted || 0,
      avatar: insertUser.avatar,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  // Spot operations
  async getAllSpots(): Promise<Spot[]> {
    return this.spots;
  }

  async getTrendingSpots(): Promise<Spot[]> {
    return this.spots.filter(spot => spot.trending);
  }

  async getGymClasses(): Promise<Spot[]> {
    return this.spots.filter(spot => spot.category === 'gym');
  }

  async getSpot(id: number): Promise<Spot | undefined> {
    return this.spots.find(spot => spot.id === id);
  }

  async createSpot(insertSpot: InsertSpot): Promise<Spot> {
    const newSpot: Spot = {
      id: this.spots.length + 1,
      createdAt: new Date(),
      name: insertSpot.name,
      description: insertSpot.description,
      category: insertSpot.category,
      latitude: insertSpot.latitude,
      longitude: insertSpot.longitude,
      address: insertSpot.address,
      rating: insertSpot.rating || 4.5,
      huntCount: insertSpot.huntCount || 0,
      imageUrl: insertSpot.imageUrl,
      trending: insertSpot.trending || false
    };
    this.spots.push(newSpot);
    return newSpot;
  }

  async huntSpot(userId: number, spotId: number): Promise<SpotHunt> {
    const newSpotHunt: SpotHunt = {
      id: this.spotHunts.length + 1,
      userId: userId.toString(),
      spotId,
      pointsEarned: 10,
      huntedAt: new Date()
    };
    this.spotHunts.push(newSpotHunt);
    return newSpotHunt;
  }

  // Badge operations
  async getAllBadges(): Promise<Badge[]> {
    return this.badges;
  }

  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    return this.userBadges
      .filter(ub => ub.userId === userId.toString())
      .map(ub => ({
        ...ub,
        badge: this.badges.find(b => b.id === ub.badgeId)!
      }));
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    const newUserBadge: UserBadge = {
      id: this.userBadges.length + 1,
      userId: userId.toString(),
      badgeId,
      earnedAt: new Date()
    };
    this.userBadges.push(newUserBadge);
    return newUserBadge;
  }

  // Challenge operations
  async getActiveChallenges(): Promise<DailyChallenge[]> {
    return this.dailyChallenges.filter(c => c.active);
  }

  async getUserChallengeProgress(userId: number): Promise<(UserChallengeProgress & { challenge: DailyChallenge })[]> {
    return this.userChallengeProgress
      .filter(ucp => ucp.userId === userId.toString())
      .map(ucp => ({
        ...ucp,
        challenge: this.dailyChallenges.find(c => c.id === ucp.challengeId)!
      }));
  }

  async updateChallengeProgress(userId: number, challengeId: number, progress: number): Promise<UserChallengeProgress> {
    const existingProgress = this.userChallengeProgress.find(
      ucp => ucp.userId === userId.toString() && ucp.challengeId === challengeId
    );

    if (existingProgress) {
      existingProgress.progress = progress;
      return existingProgress;
    } else {
      const newProgress: UserChallengeProgress = {
        id: this.userChallengeProgress.length + 1,
        userId: userId.toString(),
        challengeId,
        progress,
        completed: false,
        completedAt: null
      };
      this.userChallengeProgress.push(newProgress);
      return newProgress;
    }
  }

  // Reward operations
  async getAvailableRewards(userId: number): Promise<Reward[]> {
    return this.rewards.filter(r => r.active);
  }

  async claimReward(userId: number, rewardId: number): Promise<boolean> {
    return true;
  }

  // Activity feed
  async getRecentActivity(): Promise<any[]> {
    return [
      {
        id: 1,
        friend: {
          name: "Madison",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face"
        },
        action: "Found a new matcha spot",
        spot: "Zen Garden Café",
        timeAgo: "2 hours ago"
      },
      {
        id: 2,
        friend: {
          name: "Taylor",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        },
        action: "Earned Matcha Maven badge",
        timeAgo: "4 hours ago"
      }
    ];
  }
}

export const storage = new MemStorage();