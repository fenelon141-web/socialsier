import { db } from "./db";
import { 
  users, spots, badges, userBadges, dailyChallenges, 
  userChallengeProgress, rewards 
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed users
  const [defaultUser] = await db.insert(users).values({
    username: "ValleyGirl123",
    email: "valley@example.com",
    level: 8,
    totalPoints: 2300,
    spotsHunted: 127,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
  }).returning();

  // Seed spots
  const spotData = [
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
    },
    {
      name: "Pure Barre Paradise 💪",
      description: "The most aesthetic barre studio ever!",
      category: "gym",
      latitude: 34.0750,
      longitude: -118.4030,
      address: "987 Fitness Blvd",
      rating: 4.9,
      huntCount: 95,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400",
      trending: true,
    },
    {
      name: "SoulCycle Vibes ✨",
      description: "Spin classes with the best playlist RN",
      category: "gym",
      latitude: 34.0760,
      longitude: -118.4040,
      address: "456 Workout Way",
      rating: 4.7,
      huntCount: 156,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400",
      trending: true,
    },
    {
      name: "Pilates Princess 👑",
      description: "Pink equipment & dreamy reformer classes",
      category: "gym",
      latitude: 34.0720,
      longitude: -118.4010,
      address: "321 Pilates Place",
      rating: 4.8,
      huntCount: 78,
      imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400",
      trending: false,
    }
  ];

  const insertedSpots = await db.insert(spots).values(spotData).returning();

  // Seed badges
  const badgeData = [
    { name: "Boba Queen", description: "Hunt 5 boba spots", emoji: "🧋", category: "drinks", requirement: "5_boba_spots", rarity: "common" },
    { name: "Avo Lover", description: "Check in at 10 avocado spots", emoji: "🥑", category: "food", requirement: "10_avocado_spots", rarity: "common" },
    { name: "Pink Vibes", description: "Find 3 pink aesthetic spots", emoji: "🌸", category: "aesthetic", requirement: "3_pink_spots", rarity: "rare" },
    { name: "Latte Art", description: "Hunt 15 coffee spots", emoji: "☕", category: "coffee", requirement: "15_coffee_spots", rarity: "common" },
    { name: "Kombucha Queen", description: "Master of fermented drinks", emoji: "👑", category: "drinks", requirement: "kombucha_master", rarity: "epic" },
    { name: "Matcha Master", description: "Expert matcha hunter", emoji: "🍵", category: "drinks", requirement: "matcha_expert", rarity: "rare" },
    { name: "Bowl Boss", description: "Acai bowl enthusiast", emoji: "🍇", category: "food", requirement: "bowl_lover", rarity: "common" },
    { name: "Workout Warrior", description: "Hit 10 trendy gym classes", emoji: "💪", category: "fitness", requirement: "10_gym_classes", rarity: "common" },
    { name: "Barre Babe", description: "Pure barre perfection", emoji: "🩰", category: "fitness", requirement: "barre_master", rarity: "rare" },
    { name: "Hot Girl Summer", description: "Complete summer fitness challenge", emoji: "🔥", category: "fitness", requirement: "summer_fitness", rarity: "epic" }
  ];

  const insertedBadges = await db.insert(badges).values(badgeData).returning();

  // Seed user badges (recent achievements)
  const userBadgeData = [
    { userId: defaultUser.id, badgeId: insertedBadges[0].id },
    { userId: defaultUser.id, badgeId: insertedBadges[1].id },
    { userId: defaultUser.id, badgeId: insertedBadges[2].id },
    { userId: defaultUser.id, badgeId: insertedBadges[3].id },
  ];

  await db.insert(userBadges).values(userBadgeData);

  // Seed daily challenges
  const [challenge] = await db.insert(dailyChallenges).values({
    title: "Find 3 aesthetic matcha spots!",
    description: "Hunt down the trendiest matcha cafes in your area",
    requirement: "3_matcha_spots",
    reward: 150,
    emoji: "💫",
    active: true,
  }).returning();

  // Seed challenge progress
  await db.insert(userChallengeProgress).values({
    userId: defaultUser.id,
    challengeId: challenge.id,
    progress: 2,
    completed: false,
  });

  // Seed rewards
  const rewardData = [
    {
      spotId: insertedSpots[0].id,
      title: "50% off matcha lattes",
      description: "Limited time offer at Oat Milk Dreams",
      discountPercent: 50,
      promoCode: "MATCHA50",
      active: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      spotId: insertedSpots[1].id,
      title: "Buy one, get one free",
      description: "BOGO bowls at Purple Vibes",
      discountPercent: null,
      promoCode: "BOGO2024",
      active: true,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  ];

  await db.insert(rewards).values(rewardData);

  console.log("Database seeded successfully!");
}

seed().catch(console.error);