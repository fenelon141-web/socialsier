import { db } from "./db";
import { spots } from "@shared/schema";

// Real trendy London spots data
const trendySpots = [
  {
    id: 1,
    name: "Attendant Coffee",
    description: "Victorian toilet-turned-coffee shop",
    latitude: 51.5074,
    longitude: -0.2738,
    rating: 4,
    imageUrl: "/placeholder-icon.svg",
    category: "café",
    trending: true,
    huntCount: 145,
    amenity: "cafe",
    priceRange: "$$",
    dietaryOptions: ["vegan", "gluten-free"],
    ambiance: ["quirky", "trendy"],
    amenities: ["wifi", "outdoor seating"],
    address: "27A Foley St, London W1W 6DY",
    createdAt: new Date()
  },
  {
    id: 2,
    name: "Dishoom",
    description: "Bombay-style café in vintage setting",
    latitude: 51.5155,
    longitude: -0.1428,
    rating: 5,
    imageUrl: "/placeholder-icon.svg",
    category: "restaurant",
    trending: true,
    huntCount: 234,
    amenity: "restaurant",
    priceRange: "$$$",
    dietaryOptions: ["vegetarian", "vegan"],
    ambiance: ["vintage", "atmospheric"],
    amenities: ["reservations", "takeaway"],
    address: "12 Upper St Martin's Ln, London WC2H 9FB",
    createdAt: new Date()
  },
  {
    id: 3,
    name: "Sketch",
    description: "Pink tearoom with egg-shaped pods",
    latitude: 51.5127,
    longitude: -0.1421,
    rating: 4,
    imageUrl: "/placeholder-icon.svg",
    category: "restaurant",
    trending: true,
    huntCount: 189,
    amenity: "restaurant",
    priceRange: "$$$$",
    dietaryOptions: ["vegetarian"],
    ambiance: ["luxury", "instagram-worthy"],
    amenities: ["reservations", "afternoon tea"],
    address: "9 Conduit St, London W1S 2XG",
    createdAt: new Date()
  },
  {
    id: 4,
    name: "1Rebel",
    description: "Boutique fitness with nightclub vibes",
    latitude: 51.5074,
    longitude: -0.2729,
    rating: 4,
    imageUrl: "/placeholder-icon.svg",
    category: "fitness",
    trending: true,
    huntCount: 98,
    amenity: "gym",
    priceRange: "$$$",
    dietaryOptions: [],
    ambiance: ["high-energy", "luxury"],
    amenities: ["classes", "personal training"],
    address: "63 St Mary Axe, London EC3A 8AA",
    createdAt: new Date()
  },
  {
    id: 5,
    name: "Farm Girl",
    description: "Australian-inspired healthy café",
    latitude: 51.5074,
    longitude: -0.2744,
    rating: 4,
    imageUrl: "/placeholder-icon.svg",
    category: "café",
    trending: true,
    huntCount: 167,
    amenity: "cafe",
    priceRange: "$$",
    dietaryOptions: ["vegan", "gluten-free", "healthy"],
    ambiance: ["healthy", "trendy"],
    amenities: ["wifi", "outdoor seating"],
    address: "1 Carnaby St, London W1F 9PB",
    createdAt: new Date()
  }
];

export async function seedSpots() {
  try {
    console.log("Seeding trendy spots...");
    
    for (const spot of trendySpots) {
      await db.insert(spots).values(spot).onConflictDoNothing();
    }
    
    console.log(`✅ Seeded ${trendySpots.length} trendy spots`);
  } catch (error) {
    console.error("Error seeding spots:", error);
  }
}