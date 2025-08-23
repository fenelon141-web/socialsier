import { db } from "./db.js";
import { 
  users, spots, badges, userBadges, dailyChallenges, 
  userChallengeProgress, rewards 
} from "@shared/schema";

async function seed() {


  // Seed users
  const [defaultUser] = await db.insert(users).values({
    username: "ValleyGirl123",
    email: "valley@example.com",
    firstName: "Valley",
    lastName: "Girl",
    dateOfBirth: new Date("1998-01-01"),
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

  // Seed badges - Unique girly and cute collection
  const badgeData = [
    // 🍹 DRINK BADGES - Girly & Cute
    { name: "Boba Princess", description: "Sip 5 boba teas like the queen you are", emoji: "🧋", category: "drinks", requirement: "5_boba_spots", rarity: "common" },
    { name: "Matcha Mermaid", description: "Dive deep into 10 matcha lattes", emoji: "🧜‍♀️", category: "drinks", requirement: "10_matcha_spots", rarity: "rare" },
    { name: "Pink Latte Lover", description: "Find 7 rose or beetroot lattes", emoji: "🌸", category: "drinks", requirement: "7_pink_lattes", rarity: "rare" },
    { name: "Golden Milk Goddess", description: "Discover 5 turmeric golden milk spots", emoji: "✨", category: "drinks", requirement: "5_golden_milk", rarity: "common" },
    { name: "Kombucha Cutie", description: "Fermented drink fanatic", emoji: "🍄", category: "drinks", requirement: "8_kombucha_spots", rarity: "rare" },
    { name: "Smoothie Sweetheart", description: "Blend into 15 smoothie spots", emoji: "🍓", category: "drinks", requirement: "15_smoothie_spots", rarity: "common" },
    { name: "Oat Milk Angel", description: "Only the creamiest plant milk", emoji: "👼", category: "drinks", requirement: "12_oat_milk_spots", rarity: "common" },
    { name: "Butterfly Pea Queen", description: "Color-changing tea royalty", emoji: "🦋", category: "drinks", requirement: "3_butterfly_pea", rarity: "epic" },
    { name: "Lavender Latte Lady", description: "Floral coffee connoisseur", emoji: "💜", category: "drinks", requirement: "6_lavender_drinks", rarity: "rare" },
    { name: "Coconut Water Cutie", description: "Hydration with tropical vibes", emoji: "🥥", category: "drinks", requirement: "10_coconut_water", rarity: "common" },

    // 🥗 FOOD BADGES - Aesthetic & Cute
    { name: "Açaí Bowl Babe", description: "Purple perfection in every bite", emoji: "🍇", category: "food", requirement: "10_acai_bowls", rarity: "common" },
    { name: "Avo Toast Angel", description: "Millennial breakfast queen", emoji: "🥑", category: "food", requirement: "15_avocado_toast", rarity: "common" },
    { name: "Poke Bowl Princess", description: "Fresh fish and rice royalty", emoji: "🐠", category: "food", requirement: "8_poke_bowls", rarity: "rare" },
    { name: "Rainbow Salad Fairy", description: "Colorful veggie magic", emoji: "🌈", category: "food", requirement: "12_rainbow_salads", rarity: "rare" },
    { name: "Sushi Sweetheart", description: "Raw fish romance", emoji: "🍣", category: "food", requirement: "10_sushi_spots", rarity: "common" },
    { name: "Chia Pudding Cutie", description: "Tiny seeds, big dreams", emoji: "🍮", category: "food", requirement: "7_chia_puddings", rarity: "common" },
    { name: "Croissant Goddess", description: "Buttery pastry perfection", emoji: "🥐", category: "food", requirement: "8_croissant_spots", rarity: "rare" },
    { name: "Macaron Muse", description: "French cookie inspiration", emoji: "🍪", category: "food", requirement: "5_macaron_spots", rarity: "epic" },
    { name: "Sourdough Sweetheart", description: "Artisan bread lover", emoji: "🍞", category: "food", requirement: "6_sourdough_spots", rarity: "rare" },
    { name: "Granola Girl", description: "Crunchy breakfast bestie", emoji: "🥣", category: "food", requirement: "9_granola_spots", rarity: "common" },
    { name: "Vegan Vanilla", description: "Plant-based princess", emoji: "🌱", category: "food", requirement: "20_vegan_spots", rarity: "rare" },
    { name: "Gluten-Free Goddess", description: "Wheat-free warrior", emoji: "🌾", category: "food", requirement: "15_gf_spots", rarity: "rare" },

    // 💪 FITNESS BADGES - Cute & Motivating
    { name: "Pilates Princess", description: "Core strength royalty", emoji: "👸", category: "fitness", requirement: "10_pilates_classes", rarity: "common" },
    { name: "Yoga Yogi", description: "Namaste all day", emoji: "🧘‍♀️", category: "fitness", requirement: "15_yoga_classes", rarity: "common" },
    { name: "Barre Bestie", description: "Shake it till you make it", emoji: "🩰", category: "fitness", requirement: "12_barre_classes", rarity: "rare" },
    { name: "Spin Sweetheart", description: "Cycling cutie", emoji: "🚴‍♀️", category: "fitness", requirement: "8_spin_classes", rarity: "common" },
    { name: "HIIT Honey", description: "High intensity, high fashion", emoji: "🍯", category: "fitness", requirement: "10_hiit_classes", rarity: "rare" },
    { name: "Dance Diva", description: "Move to the beat", emoji: "💃", category: "fitness", requirement: "6_dance_classes", rarity: "rare" },
    { name: "Hot Girl Walk", description: "Steps and selfies", emoji: "🚶‍♀️", category: "fitness", requirement: "20_walking_spots", rarity: "common" },
    { name: "Reformer Royalty", description: "Pilates machine mastery", emoji: "👑", category: "fitness", requirement: "8_reformer_classes", rarity: "epic" },
    { name: "Bootcamp Babe", description: "Sweat with style", emoji: "🔥", category: "fitness", requirement: "5_bootcamp_classes", rarity: "rare" },
    { name: "Stretching Sweetie", description: "Flexibility queen", emoji: "🤸‍♀️", category: "fitness", requirement: "12_stretch_classes", rarity: "common" },

    // ✨ AESTHETIC & LIFESTYLE BADGES
    { name: "Pink Paradise", description: "Find 10 pink aesthetic spots", emoji: "🌸", category: "aesthetic", requirement: "10_pink_spots", rarity: "rare" },
    { name: "Marble Counter Muse", description: "Instagram-worthy surfaces", emoji: "🤍", category: "aesthetic", requirement: "8_marble_spots", rarity: "rare" },
    { name: "Neon Sign Angel", description: "Glow up with LED vibes", emoji: "💡", category: "aesthetic", requirement: "6_neon_spots", rarity: "epic" },
    { name: "Plant Parent", description: "Green goddess energy", emoji: "🪴", category: "aesthetic", requirement: "12_plant_cafes", rarity: "common" },
    { name: "Golden Hour Girl", description: "Perfect lighting every time", emoji: "🌅", category: "aesthetic", requirement: "sunset_spots", rarity: "rare" },
    { name: "Mirror Selfie Queen", description: "Reflection perfection", emoji: "🪞", category: "aesthetic", requirement: "mirror_spots", rarity: "common" },
    { name: "Flower Wall Fairy", description: "Bloom where you're photographed", emoji: "🌺", category: "aesthetic", requirement: "flower_wall_spots", rarity: "epic" },
    { name: "Rooftop Darling", description: "Sky-high vibes", emoji: "🏢", category: "aesthetic", requirement: "rooftop_spots", rarity: "rare" },

    // 🎯 ACHIEVEMENT BADGES
    { name: "First Hunt Cutie", description: "Your very first spot!", emoji: "🎉", category: "achievement", requirement: "first_hunt", rarity: "common" },
    { name: "Weekend Warrior", description: "Hunt 20 spots on weekends", emoji: "🎊", category: "achievement", requirement: "weekend_hunts", rarity: "rare" },
    { name: "Early Bird Babe", description: "Hunt 10 spots before 9am", emoji: "🐣", category: "achievement", requirement: "early_hunts", rarity: "rare" },
    { name: "Night Owl Darling", description: "Hunt 8 spots after 8pm", emoji: "🦉", category: "achievement", requirement: "night_hunts", rarity: "rare" },
    { name: "Social Butterfly", description: "Share 15 spots with friends", emoji: "🦋", category: "achievement", requirement: "social_shares", rarity: "common" },
    { name: "Explorer Extraordinaire", description: "Visit 50 unique spots", emoji: "🗺️", category: "achievement", requirement: "50_unique_spots", rarity: "epic" },
    { name: "Trendsetter", description: "Discover 5 spots before they trend", emoji: "🔮", category: "achievement", requirement: "trend_predictor", rarity: "legendary" },
    { name: "Local Legend", description: "Hunt 100 spots in your city", emoji: "🏆", category: "achievement", requirement: "100_local_spots", rarity: "legendary" }
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


}

