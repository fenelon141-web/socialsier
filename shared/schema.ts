import { pgTable, text, varchar, serial, integer, boolean, timestamp, real, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (keeping existing structure for now)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // For email/password authentication
  level: integer("level").notNull().default(1),
  totalPoints: integer("total_points").notNull().default(0),
  spotsHunted: integer("spots_hunted").notNull().default(0),
  avatar: text("avatar"),
  // Push notification preferences
  pushToken: text("push_token"), // Device push notification token
  notifyFriendActivity: boolean("notify_friend_activity").default(true),
  notifyNearbySpots: boolean("notify_nearby_spots").default(true),
  notifyChallengeReminders: boolean("notify_challenge_reminders").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const spots = pgTable("spots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // cafe, bowl, smoothie, gym, etc
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address").notNull(),
  rating: real("rating").notNull().default(4.5),
  huntCount: integer("hunt_count").notNull().default(0),
  imageUrl: text("image_url").notNull(),
  trending: boolean("trending").notNull().default(false),
  // Advanced search filter fields
  priceRange: text("price_range").default("$$"), // $, $$, $$$, $$$$
  dietaryOptions: text("dietary_options").array().default([]), // vegan, vegetarian, gluten_free, keto, etc
  ambiance: text("ambiance").array().default([]), // trendy, cozy, minimalist, vibrant, etc
  amenities: text("amenities").array().default([]), // wifi, outdoor_seating, instagram_worthy, etc
  createdAt: timestamp("created_at").defaultNow()
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  emoji: text("emoji").notNull(),
  category: text("category").notNull(),
  requirement: text("requirement").notNull(),
  rarity: text("rarity").notNull() // common, rare, epic, legendary
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow()
});

export const spotHunts = pgTable("spot_hunts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  spotId: integer("spot_id").notNull(),
  pointsEarned: integer("points_earned").notNull().default(50),
  huntedAt: timestamp("hunted_at").defaultNow()
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirement: text("requirement").notNull(),
  reward: integer("reward").notNull(),
  emoji: text("emoji").notNull(),
  active: boolean("active").notNull().default(true),
  date: timestamp("date").defaultNow()
});

export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at")
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  spotId: integer("spot_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountPercent: integer("discount_percent"),
  promoCode: text("promo_code"),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at")
});

// Social features tables
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull(),
  addresseeId: varchar("addressee_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at")
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  spotId: integer("spot_id"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  type: text("type").notNull().default("checkin"), // checkin, review, photo
  rating: integer("rating"), // 1-5 stars for reviews
  createdAt: timestamp("created_at").defaultNow()
});

export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const spotReviews = pgTable("spot_reviews", {
  id: serial("id").primaryKey(),
  spotId: integer("spot_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow()
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // friend_activity, nearby_spot, challenge_reminder
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional notification data
  read: boolean("read").default(false),
  sent: boolean("sent").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// User availability calendar
export const userAvailability = pgTable("user_availability", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  isAvailable: boolean("is_available").default(true),
  note: varchar("note"), // Optional note for the day
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Squad system for group challenges and competition
export const squads = pgTable("squads", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull(),
  city: varchar("city"),
  country: varchar("country"),
  isPublic: boolean("is_public").default(true),
  maxMembers: integer("max_members").default(10),
  totalPoints: integer("total_points").default(0),
  totalSpotsHunted: integer("total_spots_hunted").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const squadMembers = pgTable("squad_members", {
  id: serial("id").primaryKey(),
  squadId: integer("squad_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role").default("member"), // admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Group challenges for squad vs squad and city-wide competition
export const groupChallenges = pgTable("group_challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // squad_vs_squad, city_wide, global
  challengeType: varchar("challenge_type").notNull(), // spots_hunted, points_earned, badges_collected, distance_traveled
  targetValue: integer("target_value").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  city: varchar("city"), // For city-wide challenges
  country: varchar("country"),
  createdBy: varchar("created_by"),
  isActive: boolean("is_active").default(true),
  prizeDescription: text("prize_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupChallengeParticipants = pgTable("group_challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  participantId: varchar("participant_id").notNull(), // Can be user ID or squad ID
  participantType: varchar("participant_type").notNull(), // user, squad
  currentProgress: integer("current_progress").default(0),
  rank: integer("rank").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// City leaderboards for location-based competition
export const cityLeaderboards = pgTable("city_leaderboards", {
  id: serial("id").primaryKey(),
  city: varchar("city").notNull(),
  country: varchar("country").notNull(),
  period: varchar("period").notNull(), // weekly, monthly, all_time
  leaderboardType: varchar("leaderboard_type").notNull(), // individual, squad
  data: jsonb("data").notNull(), // Leaderboard entries with rankings
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Insert schemas  
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertSpotSchema = createInsertSchema(spots).omit({
  id: true,
  createdAt: true
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true
});

export const insertSpotHuntSchema = createInsertSchema(spotHunts).omit({
  id: true,
  huntedAt: true
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
  acceptedAt: true
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
  createdAt: true
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true
});

export const insertSpotReviewSchema = createInsertSchema(spotReviews).omit({
  id: true,
  createdAt: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

export const insertUserAvailabilitySchema = createInsertSchema(userAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSquadSchema = createInsertSchema(squads).omit({
  id: true,
  createdAt: true
});

export const insertSquadMemberSchema = createInsertSchema(squadMembers).omit({
  id: true,
  joinedAt: true
});

export const insertGroupChallengeSchema = createInsertSchema(groupChallenges).omit({
  id: true,
  createdAt: true
});

export const insertGroupChallengeParticipantSchema = createInsertSchema(groupChallengeParticipants).omit({
  id: true,
  joinedAt: true
});

export const insertCityLeaderboardSchema = createInsertSchema(cityLeaderboards).omit({
  id: true,
  lastUpdated: true
});

// Types
// Relations
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  badges: many(userBadges),
  spotHunts: many(spotHunts),
  challengeProgress: many(userChallengeProgress),
  posts: many(posts),
  postLikes: many(postLikes),
  postComments: many(postComments),
  spotReviews: many(spotReviews),
  sentFriendRequests: many(friendships, { relationName: "requester" }),
  receivedFriendRequests: many(friendships, { relationName: "addressee" })
}));

export const spotsRelations = relations(spots, ({ many }) => ({
  hunts: many(spotHunts),
  rewards: many(rewards),
  posts: many(posts),
  reviews: many(spotReviews)
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const spotHuntsRelations = relations(spotHunts, ({ one }) => ({
  user: one(users, {
    fields: [spotHunts.userId],
    references: [users.id],
  }),
  spot: one(spots, {
    fields: [spotHunts.spotId],
    references: [spots.id],
  }),
}));

export const dailyChallengesRelations = relations(dailyChallenges, ({ many }) => ({
  userProgress: many(userChallengeProgress),
}));

export const userChallengeProgressRelations = relations(userChallengeProgress, ({ one }) => ({
  user: one(users, {
    fields: [userChallengeProgress.userId],
    references: [users.id],
  }),
  challenge: one(dailyChallenges, {
    fields: [userChallengeProgress.challengeId],
    references: [dailyChallenges.id],
  }),
}));

export const rewardsRelations = relations(rewards, ({ one }) => ({
  spot: one(spots, {
    fields: [rewards.spotId],
    references: [spots.id],
  }),
}));

// Social relations
export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "requester"
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "addressee"
  })
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id]
  }),
  spot: one(spots, {
    fields: [posts.spotId],
    references: [spots.id]
  }),
  likes: many(postLikes),
  comments: many(postComments)
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id]
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id]
  })
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id]
  }),
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id]
  })
}));

export const spotReviewsRelations = relations(spotReviews, ({ one }) => ({
  spot: one(spots, {
    fields: [spotReviews.spotId],
    references: [spots.id]
  }),
  user: one(users, {
    fields: [spotReviews.userId],
    references: [users.id]
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

export const userAvailabilityRelations = relations(userAvailability, ({ one }) => ({
  user: one(users, {
    fields: [userAvailability.userId],
    references: [users.id]
  })
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type Spot = typeof spots.$inferSelect;
export type InsertSpot = z.infer<typeof insertSpotSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type SpotHunt = typeof spotHunts.$inferSelect;
export type InsertSpotHunt = z.infer<typeof insertSpotHuntSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;

// Social types
export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type SpotReview = typeof spotReviews.$inferSelect;
export type InsertSpotReview = z.infer<typeof insertSpotReviewSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UserAvailability = typeof userAvailability.$inferSelect;
export type InsertUserAvailability = z.infer<typeof insertUserAvailabilitySchema>;

// Squad and leaderboard types
export type Squad = typeof squads.$inferSelect;
export type InsertSquad = z.infer<typeof insertSquadSchema>;
export type SquadMember = typeof squadMembers.$inferSelect;
export type InsertSquadMember = z.infer<typeof insertSquadMemberSchema>;
export type GroupChallenge = typeof groupChallenges.$inferSelect;
export type InsertGroupChallenge = z.infer<typeof insertGroupChallengeSchema>;
export type GroupChallengeParticipant = typeof groupChallengeParticipants.$inferSelect;
export type InsertGroupChallengeParticipant = z.infer<typeof insertGroupChallengeParticipantSchema>;
export type CityLeaderboard = typeof cityLeaderboards.$inferSelect;
export type InsertCityLeaderboard = z.infer<typeof insertCityLeaderboardSchema>;
