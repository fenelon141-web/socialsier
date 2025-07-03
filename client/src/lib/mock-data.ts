import type { Spot, Badge, User } from "@shared/schema";

export const mockUser: User = {
  id: 1,
  username: "ValleyGirl123",
  email: "valley@example.com",
  level: 8,
  totalPoints: 2300,
  spotsHunted: 127,
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
  createdAt: new Date()
};

export const mockSpots: Spot[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
  }
];

export const mockBadges: Badge[] = [
  {
    id: 1,
    name: "Boba Queen",
    description: "Hunt 5 boba spots",
    emoji: "🧋",
    category: "drinks",
    requirement: "5_boba_spots",
    rarity: "common"
  },
  {
    id: 2,
    name: "Avo Lover",
    description: "Check in at 10 avocado spots",
    emoji: "🥑",
    category: "food",
    requirement: "10_avocado_spots",
    rarity: "common"
  },
  {
    id: 3,
    name: "Pink Vibes",
    description: "Find 3 pink aesthetic spots",
    emoji: "🌸",
    category: "aesthetic",
    requirement: "3_pink_spots",
    rarity: "rare"
  },
  {
    id: 4,
    name: "Latte Art",
    description: "Hunt 15 coffee spots",
    emoji: "☕",
    category: "coffee",
    requirement: "15_coffee_spots",
    rarity: "common"
  }
];
