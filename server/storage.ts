import { 
  type User, type InsertUser, type Spot, type InsertSpot, 
  type Badge, type UserBadge, type SpotHunt, type DailyChallenge, 
  type UserChallengeProgress, type Reward, type Friendship, type InsertFriendship,
  type Post, type InsertPost, type PostLike, type InsertPostLike,
  type PostComment, type InsertPostComment, type SpotReview, type InsertSpotReview
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;

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

  // Social Features
  // Friends
  sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship>;
  acceptFriendRequest(friendshipId: number): Promise<Friendship>;
  getFriends(userId: string): Promise<User[]>;
  getFriendRequests(userId: string): Promise<(Friendship & { requester: User })[]>;
  
  // Posts & Feed
  createPost(post: InsertPost): Promise<Post>;
  getFeedPosts(userId: string): Promise<(Post & { user: User; spot?: Spot; likes: PostLike[]; comments: PostComment[] })[]>;
  getUserPosts(userId: string): Promise<(Post & { spot?: Spot; likes: PostLike[]; comments: PostComment[] })[]>;
  likePost(userId: string, postId: number): Promise<PostLike>;
  unlikePost(userId: string, postId: number): Promise<boolean>;
  commentOnPost(userId: string, postId: number, content: string): Promise<PostComment>;
  
  // Spot Reviews
  createSpotReview(review: InsertSpotReview): Promise<SpotReview>;
  getSpotReviews(spotId: number): Promise<(SpotReview & { user: User })[]>;
  getUserReviews(userId: string): Promise<(SpotReview & { spot: Spot })[]>;
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
  
  // Social storage
  private friendships: Friendship[] = [];
  private posts: Post[] = [];
  private postLikes: PostLike[] = [];
  private postComments: PostComment[] = [];
  private spotReviews: SpotReview[] = [];
  private nextPostId = 1;
  private nextFriendshipId = 1;
  private nextCommentId = 1;
  private nextLikeId = 1;
  private nextReviewId = 1;

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    // Create default users if none exist yet
    if (this.users.length === 0) {
      const defaultUsers: User[] = [
        {
          id: 1,
          username: "Guest User",
          email: "guest@example.com",
          password: null, // No password for guest account
          level: 1,
          totalPoints: 0,
          spotsHunted: 0,
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
          createdAt: new Date()
        },
        {
          id: 2,
          username: "sophie_cafes",
          email: "sophie@example.com",
          password: null, // Demo user
          level: 3,
          totalPoints: 450,
          spotsHunted: 12,
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          createdAt: new Date()
        },
        {
          id: 3,
          username: "matcha_lover",
          email: "emma@example.com",
          password: null, // Demo user
          level: 2,
          totalPoints: 280,
          spotsHunted: 8,
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
          createdAt: new Date()
        },
        {
          id: 4,
          username: "fitness_queen",
          email: "maya@example.com",
          password: null, // Demo user
          level: 4,
          totalPoints: 620,
          spotsHunted: 18,
          avatar: "https://images.unsplash.com/photo-1491349174775-aaafddd81942?w=150&h=150&fit=crop&crop=face",
          createdAt: new Date()
        }
      ];
      this.users.push(...defaultUsers);
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

  async searchUsers(query: string): Promise<User[]> {
    const searchTerm = query.toLowerCase();
    return this.users.filter(user => {
      // Search by username (with or without @)
      const username = user.username.toLowerCase();
      if (username.includes(searchTerm) || username.includes(searchTerm.replace('@', ''))) {
        return true;
      }
      
      // Search by email
      if (user.email && user.email.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      return false;
    }).slice(0, 10); // Limit to 10 results
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

  // Social Features Implementation
  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
    const friendship: Friendship = {
      id: this.nextFriendshipId++,
      requesterId,
      addresseeId,
      status: "pending",
      createdAt: new Date(),
      acceptedAt: null
    };
    this.friendships.push(friendship);
    return friendship;
  }

  async acceptFriendRequest(friendshipId: number): Promise<Friendship> {
    const friendship = this.friendships.find(f => f.id === friendshipId);
    if (!friendship) throw new Error("Friendship not found");
    
    friendship.status = "accepted";
    friendship.acceptedAt = new Date();
    return friendship;
  }

  async getFriends(userId: string): Promise<User[]> {
    const friendships = this.friendships.filter(f => 
      (f.requesterId === userId || f.addresseeId === userId) && f.status === "accepted"
    );
    
    const friendIds = friendships.map(f => 
      f.requesterId === userId ? f.addresseeId : f.requesterId
    );
    
    return this.users.filter(u => friendIds.includes(u.id.toString()));
  }

  async getFriendRequests(userId: string): Promise<(Friendship & { requester: User })[]> {
    const requests = this.friendships.filter(f => 
      f.addresseeId === userId && f.status === "pending"
    );
    
    return requests.map(req => {
      const requester = this.users.find(u => u.id.toString() === req.requesterId);
      return { ...req, requester: requester! };
    });
  }

  async createPost(post: InsertPost): Promise<Post> {
    const newPost: Post = {
      id: this.nextPostId++,
      ...post,
      createdAt: new Date()
    };
    this.posts.push(newPost);
    return newPost;
  }

  async getFeedPosts(userId: string): Promise<(Post & { user: User; spot?: Spot; likes: PostLike[]; comments: PostComment[] })[]> {
    const friends = await this.getFriends(userId);
    const friendIds = friends.map(f => f.id.toString());
    friendIds.push(userId); // Include user's own posts
    
    const feedPosts = this.posts
      .filter(p => friendIds.includes(p.userId))
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, 20);
    
    return feedPosts.map(post => {
      const user = this.users.find(u => u.id.toString() === post.userId)!;
      const spot = post.spotId ? this.spots.find(s => s.id === post.spotId) : undefined;
      const likes = this.postLikes.filter(l => l.postId === post.id);
      const comments = this.postComments.filter(c => c.postId === post.id);
      
      return { ...post, user, spot, likes, comments };
    });
  }

  async getUserPosts(userId: string): Promise<(Post & { spot?: Spot; likes: PostLike[]; comments: PostComment[] })[]> {
    const userPosts = this.posts
      .filter(p => p.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return userPosts.map(post => {
      const spot = post.spotId ? this.spots.find(s => s.id === post.spotId) : undefined;
      const likes = this.postLikes.filter(l => l.postId === post.id);
      const comments = this.postComments.filter(c => c.postId === post.id);
      
      return { ...post, spot, likes, comments };
    });
  }

  async likePost(userId: string, postId: number): Promise<PostLike> {
    const existingLike = this.postLikes.find(l => l.userId === userId && l.postId === postId);
    if (existingLike) return existingLike;
    
    const like: PostLike = {
      id: this.nextLikeId++,
      postId,
      userId,
      createdAt: new Date()
    };
    this.postLikes.push(like);
    return like;
  }

  async unlikePost(userId: string, postId: number): Promise<boolean> {
    const likeIndex = this.postLikes.findIndex(l => l.userId === userId && l.postId === postId);
    if (likeIndex === -1) return false;
    
    this.postLikes.splice(likeIndex, 1);
    return true;
  }

  async commentOnPost(userId: string, postId: number, content: string): Promise<PostComment> {
    const comment: PostComment = {
      id: this.nextCommentId++,
      postId,
      userId,
      content,
      createdAt: new Date()
    };
    this.postComments.push(comment);
    return comment;
  }

  async createSpotReview(review: InsertSpotReview): Promise<SpotReview> {
    const newReview: SpotReview = {
      id: this.nextReviewId++,
      ...review,
      createdAt: new Date()
    };
    this.spotReviews.push(newReview);
    return newReview;
  }

  async getSpotReviews(spotId: number): Promise<(SpotReview & { user: User })[]> {
    const reviews = this.spotReviews
      .filter(r => r.spotId === spotId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return reviews.map(review => {
      const user = this.users.find(u => u.id.toString() === review.userId)!;
      return { ...review, user };
    });
  }

  async getUserReviews(userId: string): Promise<(SpotReview & { spot: Spot })[]> {
    const reviews = this.spotReviews
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return reviews.map(review => {
      const spot = this.spots.find(s => s.id === review.spotId)!;
      return { ...review, spot };
    });
  }
}

export const storage = new MemStorage();