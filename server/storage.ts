import { 
  type User, type InsertUser, type Spot, type InsertSpot, 
  type Badge, type UserBadge, type SpotHunt, type DailyChallenge, 
  type UserChallengeProgress, type Reward, type Friendship, type InsertFriendship,
  type Post, type InsertPost, type PostLike, type InsertPostLike,
  type PostComment, type InsertPostComment, type SpotReview, type InsertSpotReview,
  type Notification, type InsertNotification, type UserAvailability, type InsertUserAvailability,
  type Squad, type InsertSquad, type SquadMember, type InsertSquadMember,
  type GroupChallenge, type InsertGroupChallenge, type GroupChallengeParticipant, type InsertGroupChallengeParticipant,
  type CityLeaderboard, type InsertCityLeaderboard
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

  // User Analytics
  getUserStats(userId: number): Promise<{
    spotsHunted: number;
    totalPoints: number;
    currentStreak: number;
    favoriteCategory: string;
    mostActiveTime: string;
    aestheticScore: number;
  }>;
  getUserAchievements(userId: number): Promise<{
    title: string;
    description: string;
    date: string;
    icon: string;
  }[]>;

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

  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: number): Promise<Notification>;
  updateUserPushSettings(userId: string, settings: any): Promise<User>;

  // User Availability Calendar
  getUserAvailability(userId: string, month: string): Promise<UserAvailability[]>;
  setUserAvailability(userId: string, date: string, isAvailable: boolean, note?: string): Promise<UserAvailability>;
  getFriendsAvailability(userId: string, date: string): Promise<(UserAvailability & { user: User })[]>;

  // Squad Features
  createSquad(squad: InsertSquad): Promise<Squad>;
  joinSquad(squadId: number, userId: string): Promise<SquadMember>;
  leaveSquad(squadId: number, userId: string): Promise<boolean>;
  getUserSquads(userId: string): Promise<(SquadMember & { squad: Squad })[]>;
  getSquadMembers(squadId: number): Promise<(SquadMember & { user: User })[]>;
  getSquadsByCity(city: string, country: string): Promise<Squad[]>;
  updateSquadStats(squadId: number, pointsToAdd: number, spotsToAdd: number): Promise<Squad>;

  // Group Challenges
  createGroupChallenge(challenge: InsertGroupChallenge): Promise<GroupChallenge>;
  joinGroupChallenge(challengeId: number, participantId: string, participantType: 'user' | 'squad'): Promise<GroupChallengeParticipant>;
  updateGroupChallengeProgress(challengeId: number, participantId: string, participantType: 'user' | 'squad', progress: number): Promise<GroupChallengeParticipant>;
  getActiveGroupChallenges(city?: string, country?: string): Promise<GroupChallenge[]>;
  getChallengeLeaderboard(challengeId: number): Promise<(GroupChallengeParticipant & { 
    user?: User; 
    squad?: Squad & { members: SquadMember[] } 
  })[]>;

  // City Leaderboards
  updateCityLeaderboard(city: string, country: string, period: 'weekly' | 'monthly' | 'all_time', leaderboardType: 'individual' | 'squad'): Promise<CityLeaderboard>;
  getCityLeaderboard(city: string, country: string, period: 'weekly' | 'monthly' | 'all_time', leaderboardType: 'individual' | 'squad'): Promise<CityLeaderboard | undefined>;
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
  private notifications: Notification[] = [];
  private userAvailabilities: UserAvailability[] = [];
  
  // Squad and leaderboard storage
  private squads: Squad[] = [];
  private squadMembers: SquadMember[] = [];
  private groupChallenges: GroupChallenge[] = [];
  private groupChallengeParticipants: GroupChallengeParticipant[] = [];
  private cityLeaderboards: CityLeaderboard[] = [];
  private nextPostId = 1;
  private nextFriendshipId = 1;
  private nextCommentId = 1;
  private nextLikeId = 1;
  private nextReviewId = 1;
  private nextNotificationId = 1;
  private nextAvailabilityId = 1;
  private nextSquadId = 1;
  private nextSquadMemberId = 1;
  private nextGroupChallengeId = 1;
  private nextGroupChallengeParticipantId = 1;
  private nextLeaderboardId = 1;

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

  async createSpot(insertSpot: any): Promise<Spot> {
    const newSpot: Spot = {
      id: insertSpot.id || this.spots.length + 1,
      createdAt: new Date(),
      name: insertSpot.name,
      description: insertSpot.description,
      category: insertSpot.category,
      latitude: insertSpot.latitude,
      longitude: insertSpot.longitude,
      address: insertSpot.address || "",
      rating: insertSpot.rating || 4.5,
      huntCount: insertSpot.huntCount || 0,
      imageUrl: insertSpot.imageUrl || "",
      trending: insertSpot.trending || false,
      priceRange: insertSpot.priceRange || "$$",
      dietaryOptions: insertSpot.dietaryOptions || [],
      ambiance: insertSpot.ambiance || [],
      amenities: insertSpot.amenities || []
    };
    this.spots.push(newSpot);
    return newSpot;
  }

  async huntSpot(userId: number, spotId: number): Promise<SpotHunt> {
    const spot = await this.getSpot(spotId);
    const pointsEarned = 50; // Standard points for hunting a spot
    
    const newSpotHunt: SpotHunt = {
      id: this.spotHunts.length + 1,
      userId: userId.toString(),
      spotId,
      pointsEarned,
      huntedAt: new Date()
    };
    this.spotHunts.push(newSpotHunt);

    // Update user stats - add points and increment spots hunted
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = await this.updateUser(userId, {
        totalPoints: user.totalPoints + pointsEarned,
        spotsHunted: user.spotsHunted + 1
      });
      
      // Check for badge achievements based on hunts
      const userHunts = this.spotHunts.filter(hunt => hunt.userId === userId.toString());
      
      // Award "First Hunt Cutie" badge for first hunt (only if not already earned)
      if (userHunts.length === 1) {
        const hasFirstHuntBadge = await this.hasUserBadge(userId, 41);
        if (!hasFirstHuntBadge) {
          await this.awardBadge(userId, 41); // First Hunt Cutie badge
        }
      }
      
      // Award category-specific badges based on spot type
      if (spot) {
        const description = spot.description?.toLowerCase() || '';
        const name = spot.name?.toLowerCase() || '';
        
        // Award immediate badges for specific types
        if ((description.includes('boba') || name.includes('boba')) && !(await this.hasUserBadge(userId, 1))) {
          await this.awardBadge(userId, 1); // Boba Princess
        }
        
        if ((description.includes('matcha') || name.includes('matcha')) && !(await this.hasUserBadge(userId, 2))) {
          await this.awardBadge(userId, 2); // Matcha Mermaid
        }
        
        if ((description.includes('avocado') || description.includes('avo') || name.includes('avocado')) && !(await this.hasUserBadge(userId, 12))) {
          await this.awardBadge(userId, 12); // Avo Toast Angel
        }
        
        if ((spot.category === 'fitness' || spot.category === 'gym' || description.includes('fitness') || description.includes('yoga') || description.includes('pilates')) && !(await this.hasUserBadge(userId, 25))) {
          await this.awardBadge(userId, 25); // Barre Bestie
        }
        
        if ((description.includes('coffee') || name.includes('coffee') || name.includes('starbucks') || name.includes('costa')) && !(await this.hasUserBadge(userId, 33))) {
          await this.awardBadge(userId, 33); // Pink Paradise (aesthetic cafe badge)
        }
        
        // Award milestone badges based on total hunts
        const totalHunts = userHunts.length;
        if (totalHunts >= 5 && !(await this.hasUserBadge(userId, 42))) {
          await this.awardBadge(userId, 42); // Weekend Warrior
        }
        if (totalHunts >= 10 && !(await this.hasUserBadge(userId, 46))) {
          await this.awardBadge(userId, 46); // Local Legend
        }
      }
    }

    return newSpotHunt;
  }

  // Helper method to get user hunts by category/description
  private async getUserSpotHuntsByCategory(userId: number, keyword: string): Promise<SpotHunt[]> {
    const userHunts = this.spotHunts.filter(hunt => hunt.userId === userId.toString());
    const categoryHunts: SpotHunt[] = [];
    
    for (const hunt of userHunts) {
      const spot = await this.getSpot(hunt.spotId);
      if (spot && (
        spot.category.toLowerCase().includes(keyword) ||
        spot.description.toLowerCase().includes(keyword) ||
        spot.name.toLowerCase().includes(keyword)
      )) {
        categoryHunts.push(hunt);
      }
    }
    
    return categoryHunts;
  }

  // Badge operations
  async getAllBadges(): Promise<Badge[]> {
    // Initialize badges if none exist yet
    if (this.badges.length === 0) {
      this.badges = [
        // 🍹 DRINK BADGES - Girly & Cute
        { id: 1, name: "Boba Princess", description: "Sip 5 boba teas like the queen you are", emoji: "🧋", category: "drinks", requirement: "5_boba_spots", rarity: "common" },
        { id: 2, name: "Matcha Mermaid", description: "Dive deep into 10 matcha lattes", emoji: "🧜‍♀️", category: "drinks", requirement: "10_matcha_spots", rarity: "rare" },
        { id: 3, name: "Pink Latte Lover", description: "Find 7 rose or beetroot lattes", emoji: "🌸", category: "drinks", requirement: "7_pink_lattes", rarity: "rare" },
        { id: 4, name: "Golden Milk Goddess", description: "Discover 5 turmeric golden milk spots", emoji: "✨", category: "drinks", requirement: "5_golden_milk", rarity: "common" },
        { id: 5, name: "Kombucha Cutie", description: "Fermented drink fanatic", emoji: "🍄", category: "drinks", requirement: "8_kombucha_spots", rarity: "rare" },
        { id: 6, name: "Smoothie Sweetheart", description: "Blend into 15 smoothie spots", emoji: "🍓", category: "drinks", requirement: "15_smoothie_spots", rarity: "common" },
        { id: 7, name: "Oat Milk Angel", description: "Only the creamiest plant milk", emoji: "👼", category: "drinks", requirement: "12_oat_milk_spots", rarity: "common" },
        { id: 8, name: "Butterfly Pea Queen", description: "Color-changing tea royalty", emoji: "🦋", category: "drinks", requirement: "3_butterfly_pea", rarity: "epic" },
        { id: 9, name: "Lavender Latte Lady", description: "Floral coffee connoisseur", emoji: "💜", category: "drinks", requirement: "6_lavender_drinks", rarity: "rare" },
        { id: 10, name: "Coconut Water Cutie", description: "Hydration with tropical vibes", emoji: "🥥", category: "drinks", requirement: "10_coconut_water", rarity: "common" },

        // 🥗 FOOD BADGES - Aesthetic & Cute
        { id: 11, name: "Açaí Bowl Babe", description: "Purple perfection in every bite", emoji: "🍇", category: "food", requirement: "10_acai_bowls", rarity: "common" },
        { id: 12, name: "Avo Toast Angel", description: "Millennial breakfast queen", emoji: "🥑", category: "food", requirement: "15_avocado_toast", rarity: "common" },
        { id: 13, name: "Poke Bowl Princess", description: "Fresh fish and rice royalty", emoji: "🐠", category: "food", requirement: "8_poke_bowls", rarity: "rare" },
        { id: 14, name: "Rainbow Salad Fairy", description: "Colorful veggie magic", emoji: "🌈", category: "food", requirement: "12_rainbow_salads", rarity: "rare" },
        { id: 15, name: "Sushi Sweetheart", description: "Raw fish romance", emoji: "🍣", category: "food", requirement: "10_sushi_spots", rarity: "common" },
        { id: 16, name: "Chia Pudding Cutie", description: "Tiny seeds, big dreams", emoji: "🍮", category: "food", requirement: "7_chia_puddings", rarity: "common" },
        { id: 17, name: "Croissant Goddess", description: "Buttery pastry perfection", emoji: "🥐", category: "food", requirement: "8_croissant_spots", rarity: "rare" },
        { id: 18, name: "Macaron Muse", description: "French cookie inspiration", emoji: "🍪", category: "food", requirement: "5_macaron_spots", rarity: "epic" },
        { id: 19, name: "Sourdough Sweetheart", description: "Artisan bread lover", emoji: "🍞", category: "food", requirement: "6_sourdough_spots", rarity: "rare" },
        { id: 20, name: "Granola Girl", description: "Crunchy breakfast bestie", emoji: "🥣", category: "food", requirement: "9_granola_spots", rarity: "common" },
        { id: 21, name: "Vegan Vanilla", description: "Plant-based princess", emoji: "🌱", category: "food", requirement: "20_vegan_spots", rarity: "rare" },
        { id: 22, name: "Gluten-Free Goddess", description: "Wheat-free warrior", emoji: "🌾", category: "food", requirement: "15_gf_spots", rarity: "rare" },

        // 💪 FITNESS BADGES - Cute & Motivating
        { id: 23, name: "Pilates Princess", description: "Core strength royalty", emoji: "👸", category: "fitness", requirement: "10_pilates_classes", rarity: "common" },
        { id: 24, name: "Yoga Yogi", description: "Namaste all day", emoji: "🧘‍♀️", category: "fitness", requirement: "15_yoga_classes", rarity: "common" },
        { id: 25, name: "Barre Bestie", description: "Shake it till you make it", emoji: "🩰", category: "fitness", requirement: "12_barre_classes", rarity: "rare" },
        { id: 26, name: "Spin Sweetheart", description: "Cycling cutie", emoji: "🚴‍♀️", category: "fitness", requirement: "8_spin_classes", rarity: "common" },
        { id: 27, name: "HIIT Honey", description: "High intensity, high fashion", emoji: "🍯", category: "fitness", requirement: "10_hiit_classes", rarity: "rare" },
        { id: 28, name: "Dance Diva", description: "Move to the beat", emoji: "💃", category: "fitness", requirement: "6_dance_classes", rarity: "rare" },
        { id: 29, name: "Hot Girl Walk", description: "Steps and selfies", emoji: "🚶‍♀️", category: "fitness", requirement: "20_walking_spots", rarity: "common" },
        { id: 30, name: "Reformer Royalty", description: "Pilates machine mastery", emoji: "👑", category: "fitness", requirement: "8_reformer_classes", rarity: "epic" },
        { id: 31, name: "Bootcamp Babe", description: "Sweat with style", emoji: "🔥", category: "fitness", requirement: "5_bootcamp_classes", rarity: "rare" },
        { id: 32, name: "Stretching Sweetie", description: "Flexibility queen", emoji: "🤸‍♀️", category: "fitness", requirement: "12_stretch_classes", rarity: "common" },

        // ✨ AESTHETIC & LIFESTYLE BADGES
        { id: 33, name: "Pink Paradise", description: "Find 10 pink aesthetic spots", emoji: "🌸", category: "aesthetic", requirement: "10_pink_spots", rarity: "rare" },
        { id: 34, name: "Marble Counter Muse", description: "Instagram-worthy surfaces", emoji: "🤍", category: "aesthetic", requirement: "8_marble_spots", rarity: "rare" },
        { id: 35, name: "Neon Sign Angel", description: "Glow up with LED vibes", emoji: "💡", category: "aesthetic", requirement: "6_neon_spots", rarity: "epic" },
        { id: 36, name: "Plant Parent", description: "Green goddess energy", emoji: "🪴", category: "aesthetic", requirement: "12_plant_cafes", rarity: "common" },
        { id: 37, name: "Golden Hour Girl", description: "Perfect lighting every time", emoji: "🌅", category: "aesthetic", requirement: "sunset_spots", rarity: "rare" },
        { id: 38, name: "Mirror Selfie Queen", description: "Reflection perfection", emoji: "🪞", category: "aesthetic", requirement: "mirror_spots", rarity: "common" },
        { id: 39, name: "Flower Wall Fairy", description: "Bloom where you're photographed", emoji: "🌺", category: "aesthetic", requirement: "flower_wall_spots", rarity: "epic" },
        { id: 40, name: "Rooftop Darling", description: "Sky-high vibes", emoji: "🏢", category: "aesthetic", requirement: "rooftop_spots", rarity: "rare" },

        // 🎯 ACHIEVEMENT BADGES
        { id: 41, name: "First Hunt Cutie", description: "Your very first spot!", emoji: "🎉", category: "achievement", requirement: "first_hunt", rarity: "common" },
        { id: 42, name: "Weekend Warrior", description: "Hunt 20 spots on weekends", emoji: "🎊", category: "achievement", requirement: "weekend_hunts", rarity: "rare" },
        { id: 43, name: "Early Bird Babe", description: "Hunt 10 spots before 9am", emoji: "🐣", category: "achievement", requirement: "early_hunts", rarity: "rare" },
        { id: 44, name: "Night Owl Darling", description: "Hunt 8 spots after 8pm", emoji: "🦉", category: "achievement", requirement: "night_hunts", rarity: "rare" },
        { id: 45, name: "Social Butterfly", description: "Share 15 spots with friends", emoji: "🦋", category: "achievement", requirement: "social_shares", rarity: "common" },
        { id: 46, name: "Explorer Extraordinaire", description: "Visit 50 unique spots", emoji: "🗺️", category: "achievement", requirement: "50_unique_spots", rarity: "epic" },
        { id: 47, name: "Trendsetter", description: "Discover 5 spots before they trend", emoji: "🔮", category: "achievement", requirement: "trend_predictor", rarity: "legendary" },
        { id: 48, name: "Local Legend", description: "Hunt 100 spots in your city", emoji: "🏆", category: "achievement", requirement: "100_local_spots", rarity: "legendary" }
      ];
    }
    return this.badges;
  }

  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    // Initialize sample badges for guest user to showcase the collection
    if (this.userBadges.length === 0 && userId === 1) {
      await this.getAllBadges(); // Ensure badges are initialized
      this.userBadges = [
        { id: 1, userId: "1", badgeId: 41, earnedAt: new Date() }, // First Hunt Cutie
        { id: 2, userId: "1", badgeId: 1, earnedAt: new Date() },  // Boba Princess
        { id: 3, userId: "1", badgeId: 12, earnedAt: new Date() }, // Avo Toast Angel
        { id: 4, userId: "1", badgeId: 25, earnedAt: new Date() }, // Barre Bestie
        { id: 5, userId: "1", badgeId: 33, earnedAt: new Date() }  // Pink Paradise
      ];
    }
    
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

  // Helper method to check if user already has a specific badge
  async hasUserBadge(userId: number, badgeId: number): Promise<boolean> {
    return this.userBadges.some(ub => 
      ub.userId === userId.toString() && ub.badgeId === badgeId
    );
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

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(notification: any): Promise<Notification> {
    const newNotification: Notification = {
      id: this.nextNotificationId++,
      ...notification,
      createdAt: new Date(),
      read: false
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  async markNotificationAsRead(notificationId: number): Promise<Notification> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return notification!;
  }

  async updateUserPushSettings(userId: string, settings: any): Promise<User> {
    const user = this.users.find(u => u.id.toString() === userId);
    if (user) {
      Object.assign(user, settings);
    }
    return user!;
  }

  async getUserStats(userId: number): Promise<{
    spotsHunted: number;
    totalPoints: number;
    currentStreak: number;
    favoriteCategory: string;
    mostActiveTime: string;
    aestheticScore: number;
  }> {
    const user = this.users.find(u => u.id === userId);
    const userHunts = this.spotHunts.filter(hunt => hunt.userId === userId);
    const userPosts = this.posts.filter(post => post.userId === userId.toString());
    
    // Calculate spots hunted
    const spotsHunted = userHunts.length;
    
    // Calculate total points from hunts
    const totalPoints = userHunts.reduce((sum, hunt) => sum + hunt.pointsEarned, 0);
    
    // Calculate current streak (consecutive days with activity)
    const huntDates = userHunts.map(hunt => new Date(hunt.huntedAt!)).sort((a, b) => b.getTime() - a.getTime());
    let currentStreak = 0;
    if (huntDates.length > 0) {
      const today = new Date();
      let checkDate = new Date(today);
      
      for (let i = 0; i < huntDates.length; i++) {
        const huntDate = new Date(huntDates[i]);
        const diffDays = Math.floor((checkDate.getTime() - huntDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          currentStreak++;
          checkDate = new Date(huntDate);
        } else {
          break;
        }
      }
    }
    
    // Calculate favorite category from hunted spots
    const categoryCount: { [key: string]: number } = {};
    for (const hunt of userHunts) {
      const spot = this.spots.find(s => s.id === hunt.spotId);
      if (spot && spot.category) {
        categoryCount[spot.category] = (categoryCount[spot.category] || 0) + 1;
      }
    }
    
    const favoriteCategory = Object.keys(categoryCount).length > 0 
      ? Object.entries(categoryCount).reduce((a, b) => categoryCount[a[0]] > categoryCount[b[0]] ? a : b)[0]
      : "Cafe";
    
    // Calculate most active time based on hunt times
    const hourCounts: { [key: number]: number } = {};
    for (const hunt of userHunts) {
      if (hunt.huntedAt) {
        const hour = new Date(hunt.huntedAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    }
    
    let mostActiveTime = "Morning Vibes";
    if (Object.keys(hourCounts).length > 0) {
      const peakHour = Object.entries(hourCounts).reduce((a, b) => hourCounts[a[0]] > hourCounts[b[0]] ? a : b)[0];
      const hour = parseInt(peakHour);
      if (hour >= 6 && hour < 12) mostActiveTime = "Morning Vibes";
      else if (hour >= 12 && hour < 17) mostActiveTime = "Afternoon Energy";
      else if (hour >= 17 && hour < 21) mostActiveTime = "Evening Glow";
      else mostActiveTime = "Night Owl";
    }
    
    // Calculate aesthetic score based on activity and engagement
    const baseScore = Math.min(10, Math.floor(spotsHunted / 5) + Math.floor(userPosts.length / 3));
    const streakBonus = Math.min(2, Math.floor(currentStreak / 7));
    const aestheticScore = Math.min(10, baseScore + streakBonus);
    
    return {
      spotsHunted,
      totalPoints,
      currentStreak,
      favoriteCategory,
      mostActiveTime,
      aestheticScore
    };
  }

  async getUserAchievements(userId: number): Promise<{
    title: string;
    description: string;
    date: string;
    icon: string;
  }[]> {
    const achievements: { title: string; description: string; date: string; icon: string }[] = [];
    const userHunts = this.spotHunts.filter(hunt => hunt.userId === userId);
    const userBadges = this.userBadges.filter(ub => ub.userId === userId);
    const userPosts = this.posts.filter(post => post.userId === userId.toString());
    
    // First spot achievement
    if (userHunts.length > 0) {
      const firstHunt = userHunts.sort((a, b) => new Date(a.huntedAt!).getTime() - new Date(b.huntedAt!).getTime())[0];
      achievements.push({
        title: "First Hunt",
        description: "Discovered your first spot",
        date: this.getTimeAgo(firstHunt.huntedAt),
        icon: "🎯"
      });
    }
    
    // Milestone achievements based on spots hunted
    if (userHunts.length >= 5) {
      achievements.push({
        title: "Spot Explorer",
        description: "Hunted 5+ amazing spots",
        date: this.getTimeAgo(userHunts[4].huntedAt),
        icon: "🌟"
      });
    }
    
    if (userHunts.length >= 10) {
      achievements.push({
        title: "Valley Hunter",
        description: "Discovered 10+ trendy spots",
        date: this.getTimeAgo(userHunts[9].huntedAt),
        icon: "💎"
      });
    }
    
    // Social achievements
    if (userPosts.length >= 5) {
      achievements.push({
        title: "Social Butterfly",
        description: "Shared 5+ posts with friends",
        date: this.getTimeAgo(userPosts[4].createdAt),
        icon: "🦋"
      });
    }
    
    // Badge achievements
    if (userBadges.length >= 3) {
      achievements.push({
        title: "Badge Collector",
        description: "Earned 3+ badges",
        date: this.getTimeAgo(userBadges[2].earnedAt),
        icon: "🏆"
      });
    }
    
    // Category-specific achievements
    const cafeHunts = userHunts.filter(hunt => {
      const spot = this.spots.find(s => s.id === hunt.spotId);
      return spot && (spot.category === "Cafe" || spot.description?.toLowerCase().includes("cafe"));
    });
    
    if (cafeHunts.length >= 5) {
      achievements.push({
        title: "Cafe Connoisseur",
        description: "Discovered 5+ aesthetic cafes",
        date: this.getTimeAgo(cafeHunts[4].huntedAt),
        icon: "☕"
      });
    }
    
    // Return most recent achievements (limit to 3)
    return achievements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }

  // User Availability Calendar methods
  async getUserAvailability(userId: string, month: string): Promise<UserAvailability[]> {
    return this.userAvailabilities
      .filter(availability => 
        availability.userId === userId && 
        availability.date.startsWith(month) // YYYY-MM format
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async setUserAvailability(userId: string, date: string, isAvailable: boolean, note?: string): Promise<UserAvailability> {
    // Check if availability already exists for this date
    const existingIndex = this.userAvailabilities.findIndex(
      availability => availability.userId === userId && availability.date === date
    );

    if (existingIndex >= 0) {
      // Update existing availability
      this.userAvailabilities[existingIndex] = {
        ...this.userAvailabilities[existingIndex],
        isAvailable,
        note: note || null,
        updatedAt: new Date()
      };
      return this.userAvailabilities[existingIndex];
    } else {
      // Create new availability
      const newAvailability: UserAvailability = {
        id: this.nextAvailabilityId++,
        userId,
        date,
        isAvailable,
        note: note || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.userAvailabilities.push(newAvailability);
      return newAvailability;
    }
  }

  async getFriendsAvailability(userId: string, date: string): Promise<(UserAvailability & { user: User })[]> {
    // Get user's friends
    const friends = await this.getFriends(userId);
    const friendIds = friends.map(friend => friend.id.toString());

    // Get availability for all friends on the specific date
    const friendsAvailability = this.userAvailabilities
      .filter(availability => 
        friendIds.includes(availability.userId) && 
        availability.date === date &&
        availability.isAvailable
      )
      .map(availability => {
        const user = this.users.find(u => u.id.toString() === availability.userId);
        return {
          ...availability,
          user: user!
        };
      })
      .filter(item => item.user); // Remove any with missing users

    return friendsAvailability;
  }

  // Squad Features Implementation
  async createSquad(squad: InsertSquad): Promise<Squad> {
    const newSquad: Squad = {
      id: this.nextSquadId++,
      ...squad,
      totalPoints: 0,
      totalSpotsHunted: 0,
      createdAt: new Date(),
    };
    this.squads.push(newSquad);
    
    // Add creator as admin member
    await this.joinSquad(newSquad.id, squad.createdBy);
    
    return newSquad;
  }

  async joinSquad(squadId: number, userId: string): Promise<SquadMember> {
    const squad = this.squads.find(s => s.id === squadId);
    if (!squad) throw new Error('Squad not found');
    
    const existing = this.squadMembers.find(m => m.squadId === squadId && m.userId === userId);
    if (existing) throw new Error('Already a member');
    
    const role = squad.createdBy === userId ? 'admin' : 'member';
    const member: SquadMember = {
      id: this.nextSquadMemberId++,
      squadId,
      userId,
      role,
      joinedAt: new Date()
    };
    
    this.squadMembers.push(member);
    return member;
  }

  async leaveSquad(squadId: number, userId: string): Promise<boolean> {
    const memberIndex = this.squadMembers.findIndex(m => m.squadId === squadId && m.userId === userId);
    if (memberIndex === -1) return false;
    
    this.squadMembers.splice(memberIndex, 1);
    return true;
  }

  async getUserSquads(userId: string): Promise<(SquadMember & { squad: Squad })[]> {
    return this.squadMembers
      .filter(m => m.userId === userId)
      .map(member => ({
        ...member,
        squad: this.squads.find(s => s.id === member.squadId)!
      }));
  }

  async getSquadMembers(squadId: number): Promise<(SquadMember & { user: User })[]> {
    return this.squadMembers
      .filter(m => m.squadId === squadId)
      .map(member => ({
        ...member,
        user: this.users.find(u => u.id.toString() === member.userId)!
      }));
  }

  async getSquadsByCity(city: string, country: string): Promise<Squad[]> {
    return this.squads.filter(s => s.city === city && s.country === country && s.isPublic);
  }

  async updateSquadStats(squadId: number, pointsToAdd: number, spotsToAdd: number): Promise<Squad> {
    const squad = this.squads.find(s => s.id === squadId);
    if (!squad) throw new Error('Squad not found');
    
    squad.totalPoints += pointsToAdd;
    squad.totalSpotsHunted += spotsToAdd;
    return squad;
  }

  // Group challenges implementation
  async createGroupChallenge(challenge: InsertGroupChallenge): Promise<GroupChallenge> {
    const newChallenge: GroupChallenge = {
      id: this.nextGroupChallengeId++,
      ...challenge,
      createdAt: new Date(),
    };
    this.groupChallenges.push(newChallenge);
    return newChallenge;
  }

  async joinGroupChallenge(challengeId: number, participantId: string, participantType: 'user' | 'squad'): Promise<GroupChallengeParticipant> {
    const participant: GroupChallengeParticipant = {
      id: this.nextGroupChallengeParticipantId++,
      challengeId,
      participantId,
      participantType,
      currentProgress: 0,
      rank: 0,
      joinedAt: new Date()
    };
    this.groupChallengeParticipants.push(participant);
    return participant;
  }

  async updateGroupChallengeProgress(challengeId: number, participantId: string, participantType: 'user' | 'squad', progress: number): Promise<GroupChallengeParticipant> {
    const participant = this.groupChallengeParticipants.find(p => 
      p.challengeId === challengeId && 
      p.participantId === participantId && 
      p.participantType === participantType
    );
    if (!participant) throw new Error('Participant not found');
    
    participant.currentProgress = progress;
    return participant;
  }

  async getActiveGroupChallenges(city?: string, country?: string): Promise<GroupChallenge[]> {
    const now = new Date();
    return this.groupChallenges.filter(c => 
      c.isActive && 
      c.startDate <= now && 
      c.endDate >= now &&
      (!city || c.city === city) &&
      (!country || c.country === country)
    );
  }

  async getChallengeLeaderboard(challengeId: number): Promise<(GroupChallengeParticipant & { user?: User; squad?: Squad & { members: SquadMember[] } })[]> {
    return this.groupChallengeParticipants
      .filter(p => p.challengeId === challengeId)
      .sort((a, b) => b.currentProgress - a.currentProgress)
      .map((participant, index) => {
        participant.rank = index + 1;
        return {
          ...participant,
          user: participant.participantType === 'user' ? 
            this.users.find(u => u.id.toString() === participant.participantId) : undefined,
          squad: participant.participantType === 'squad' ? 
            {
              ...this.squads.find(s => s.id.toString() === participant.participantId)!,
              members: this.squadMembers.filter(m => m.squadId.toString() === participant.participantId)
            } : undefined
        };
      });
  }

  async updateCityLeaderboard(city: string, country: string, period: 'weekly' | 'monthly' | 'all_time', leaderboardType: 'individual' | 'squad'): Promise<CityLeaderboard> {
    const leaderboard: CityLeaderboard = {
      id: this.nextLeaderboardId++,
      city,
      country,
      period,
      leaderboardType,
      data: { rankings: [] },
      lastUpdated: new Date()
    };
    
    const existingIndex = this.cityLeaderboards.findIndex(l => 
      l.city === city && l.country === country && l.period === period && l.leaderboardType === leaderboardType
    );
    
    if (existingIndex >= 0) {
      this.cityLeaderboards[existingIndex] = leaderboard;
    } else {
      this.cityLeaderboards.push(leaderboard);
    }
    
    return leaderboard;
  }

  async getCityLeaderboard(city: string, country: string, period: 'weekly' | 'monthly' | 'all_time', leaderboardType: 'individual' | 'squad'): Promise<CityLeaderboard | undefined> {
    return this.cityLeaderboards.find(l => 
      l.city === city && l.country === country && l.period === period && l.leaderboardType === leaderboardType
    );
  }
}

export const storage = new MemStorage();