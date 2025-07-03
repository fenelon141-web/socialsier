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
  private users: User[] = [];
  private spots: Spot[] = [];
  private badges: Badge[] = [];
  private userBadges: UserBadge[] = [];
  private spotHunts: SpotHunt[] = [];
  private dailyChallenges: DailyChallenge[] = [];
  private userChallengeProgress: UserChallengeProgress[] = [];
  private rewards: Reward[] = [];

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    // Create default user if none exists yet
    if (this.users.length === 0 && id === 1) {
      const defaultUser: User = {
        id: 1,
        username: "Guest User",
        email: "guest@example.com",
        level: 1,
        totalPoints: 0,
        spotsHunted: 0,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
        createdAt: new Date()
      };
      this.users.push(defaultUser);
      return defaultUser;
    }
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
    // Generate activity based on actual spot hunts and badge awards
    const activities: any[] = [];
    
    // Add recent spot hunts as activity
    this.spotHunts.slice(-5).forEach((hunt, index) => {
      const spot = this.spots.find(s => s.id === hunt.spotId);
      if (spot) {
        activities.push({
          id: activities.length + 1,
          type: 'spot_hunt',
          action: `discovered ${spot.name}`,
          spot: spot.name,
          timeAgo: this.getTimeAgo(hunt.huntedAt),
          points: hunt.pointsEarned
        });
      }
    });
    
    // Add recent badge awards as activity
    this.userBadges.slice(-3).forEach(userBadge => {
      const badge = this.badges.find(b => b.id === userBadge.badgeId);
      if (badge) {
        activities.push({
          id: activities.length + 1,
          type: 'badge_earned',
          action: `earned ${badge.name} badge`,
          badge: badge.name,
          timeAgo: this.getTimeAgo(userBadge.earnedAt),
          emoji: badge.emoji
        });
      }
    });
    
    return activities.sort((a, b) => 
      new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime()
    ).slice(0, 10);
  }
  
  private getTimeAgo(date: Date | null): string {
    if (!date) return 'just now';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'just now';
  }
}

export const storage = new MemStorage();