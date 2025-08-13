// Simple, bulletproof trendy spots service using OpenStreetMap
import type { Spot } from '@shared/schema';

interface OverpassQuery {
  category: string;
  query: string;
  spotType: 'café' | 'gym' | 'restaurant' | 'trendy';
}

// Direct queries for trendy spot categories
const TRENDY_QUERIES: OverpassQuery[] = [
  // Chai & Matcha spots
  {
    category: 'chai_matcha',
    query: `
      [out:json][timeout:10];
      (
        nwr["amenity"="cafe"]["cuisine"~"tea|matcha|chai|bubble_tea"](around:2000,{lat},{lng});
        nwr["shop"="tea"](around:2000,{lat},{lng});
        nwr["name"~"matcha|chai|boba|bubble"~i](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'café'
  },
  
  // Poki & Acai bowls
  {
    category: 'healthy_bowls',
    query: `
      [out:json][timeout:10];
      (
        nwr["amenity"="restaurant"]["cuisine"~"poke|acai|healthy|raw_food|smoothie"](around:2000,{lat},{lng});
        nwr["name"~"poke|poki|acai|bowl|juice"~i](around:2000,{lat},{lng});
        nwr["shop"="health_food"](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'restaurant'
  },
  
  // Reformer Pilates & Cute Workout Classes
  {
    category: 'trendy_fitness',
    query: `
      [out:json][timeout:10];
      (
        nwr["leisure"="fitness_centre"]["sport"~"pilates|yoga|barre"](around:2000,{lat},{lng});
        nwr["name"~"pilates|reformer|barre|yoga|soul|cycle|pure"~i](around:2000,{lat},{lng});
        nwr["amenity"="studio"]["sport"~"pilates|yoga|dance"](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'gym'
  },
  
  // Japanese, Korean, Thai, Vietnamese
  {
    category: 'asian_trendy',
    query: `
      [out:json][timeout:10];
      (
        nwr["amenity"="restaurant"]["cuisine"~"japanese|korean|thai|vietnamese|ramen|sushi"](around:2000,{lat},{lng});
        nwr["amenity"="cafe"]["cuisine"~"japanese|korean|bubble_tea"](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'restaurant'
  },
  
  // Coffee & Specialty drinks
  {
    category: 'specialty_coffee',
    query: `
      [out:json][timeout:10];
      (
        nwr["amenity"="cafe"]["cuisine"~"coffee|specialty_coffee"](around:2000,{lat},{lng});
        nwr["name"~"blue bottle|intelligentsia|stumptown|third wave|roasters"~i](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'café'
  }
];

export async function findTrendySpots(lat: number, lng: number, radius: number = 2000): Promise<any[]> {
  const allSpots: any[] = [];
  
  for (const queryConfig of TRENDY_QUERIES) {
    try {
      const query = queryConfig.query.replace(/{lat}/g, lat.toString()).replace(/{lng}/g, lng.toString());
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      for (const element of data.elements || []) {
        if (!element.lat || !element.lon) continue;
        
        const spot: any = {
          id: element.id,
          name: element.tags?.name || `Trendy ${queryConfig.category} spot`,
          description: generateDescription(element, queryConfig),
          latitude: element.lat,
          longitude: element.lon,
          address: element.tags?.['addr:full'] || '',
          rating: 4,
          imageUrl: '/placeholder-icon.svg',
          category: queryConfig.spotType,
          trending: true,
          huntCount: Math.floor(Math.random() * 50) + 5,
          distance: calculateDistance(lat, lng, element.lat, element.lon),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(element.tags?.amenity && { amenity: element.tags.amenity }),
          ...(element.tags?.cuisine && { cuisine: element.tags.cuisine }),
          ...(element.tags?.shop && { shop: element.tags.shop }),
          ...(element.tags?.sport && { sport: element.tags.sport }),
          ...(element.tags?.website && { website: element.tags.website }),
          ...(element.tags?.phone && { phone: element.tags.phone }),
          priceRange: '$$',
          dietaryOptions: [],
          ambiance: ['trendy'],
          amenities: generateAmenities(element.tags)
        };
        
        allSpots.push(spot);
      }
    } catch (error) {
      console.log(`Query ${queryConfig.category} failed:`, error);
      continue;
    }
  }
  
  // Sort by distance and return top results
  return allSpots
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 25);
}

function generateDescription(element: any, config: OverpassQuery): string {
  const tags = element.tags || {};
  
  if (config.category === 'chai_matcha') {
    if (tags.cuisine?.includes('matcha')) return 'Matcha cafe with specialty drinks and aesthetic vibes';
    if (tags.cuisine?.includes('chai')) return 'Chai spot serving authentic spiced tea and trendy beverages';
    if (tags.cuisine?.includes('bubble_tea')) return 'Bubble tea location with Instagram-worthy drinks';
  }
  
  if (config.category === 'healthy_bowls') {
    if (tags.cuisine?.includes('poke')) return 'Fresh poke bowls with sustainable fish and trendy toppings';
    if (tags.cuisine?.includes('acai')) return 'Acai bowl spot with superfood toppings and aesthetic presentation';
    if (tags.shop === 'health_food') return 'Health food store with organic and trendy wellness products';
  }
  
  if (config.category === 'trendy_fitness') {
    if (tags.sport?.includes('pilates')) return 'Boutique fitness studio with trendy group classes and personal training';
    if (tags.sport?.includes('yoga')) return 'Modern yoga studio offering stylish classes and wellness experiences';
    return 'Trendy fitness studio with Instagram-worthy workouts and community vibes';
  }
  
  if (config.spotType === 'café') return 'Coffee shop serving espresso drinks and light refreshments';
  if (config.spotType === 'restaurant') return 'Restaurant serving trendy cuisine in an aesthetic setting';
  
  return 'Trendy spot with aesthetic vibes and Instagram-worthy experiences';
}

function generateAmenities(tags: any): string[] {
  const amenities: string[] = [];
  
  if (tags?.takeaway === 'yes') amenities.push('takeaway');
  if (tags?.outdoor_seating === 'yes') amenities.push('outdoor_seating');
  if (tags?.wifi === 'yes') amenities.push('wifi');
  if (tags?.wheelchair === 'yes') amenities.push('accessible');
  
  return amenities;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return Math.round(R * c);
}