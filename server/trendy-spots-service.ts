// Simple, bulletproof trendy spots service using OpenStreetMap
import type { Spot } from '@shared/schema';

interface OverpassQuery {
  category: string;
  query: string;
  spotType: 'café' | 'gym' | 'restaurant' | 'trendy';
}

// Female-inspired wellness and trendy spot categories - NO RESTAURANTS
const TRENDY_QUERIES: OverpassQuery[] = [
  // Coffee shops only
  {
    category: 'coffee_shops',
    query: `
      [out:json][timeout:6];
      (
        nwr["amenity"="cafe"](around:2000,{lat},{lng});
        nwr["shop"="coffee"](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'café'
  },

  // Matcha & specialty tea spots
  {
    category: 'matcha_tea',
    query: `
      [out:json][timeout:6];
      (
        nwr["shop"="tea"](around:2000,{lat},{lng});
        nwr["amenity"="cafe"]["name"~"matcha|chai|tea"~i](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'café'
  },
  
  // Poki & Acai bowls (juice bars only)
  {
    category: 'juice_bowls',
    query: `
      [out:json][timeout:6];
      (
        nwr["amenity"="juice_bar"](around:2000,{lat},{lng});
        nwr["shop"="health_food"](around:2000,{lat},{lng});
        nwr["amenity"="cafe"]["name"~"poke|poki|acai|bowl|juice"~i](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'café'
  },
  
  // Reformer Pilates studios
  {
    category: 'pilates',
    query: `
      [out:json][timeout:6];
      (
        nwr["leisure"="fitness_centre"]["sport"="pilates"](around:2000,{lat},{lng});
        nwr["name"~"reformer|pilates|barre"~i](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'gym'
  },
  
  // Yoga studios
  {
    category: 'yoga',
    query: `
      [out:json][timeout:6];
      (
        nwr["leisure"="fitness_centre"]["sport"="yoga"](around:2000,{lat},{lng});
        nwr["name"~"yoga|hot.yoga|bikram|vinyasa"~i](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'gym'
  },
  
  // Spin classes
  {
    category: 'spin',
    query: `
      [out:json][timeout:6];
      (
        nwr["name"~"soul|cycle|spin|flywheel"~i](around:2000,{lat},{lng});
        nwr["leisure"="fitness_centre"]["sport"="cycling"](around:2000,{lat},{lng});
      );
      out geom;
    `,
    spotType: 'gym'
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
  const name = (tags.name || '').toLowerCase();
  
  if (config.category === 'coffee_shops') {
    if (name.includes('blue bottle')) return 'Blue Bottle Coffee – Third-wave coffee with minimalist aesthetic';
    if (name.includes('stumptown')) return 'Stumptown Coffee – Artisanal roasting and specialty drinks';
    if (name.includes('starbucks')) return 'Starbucks – Familiar coffee chain with seasonal specialty drinks';
    return 'Coffee shop serving espresso drinks and cozy vibes';
  }
  
  if (config.category === 'matcha_tea') {
    if (name.includes('matcha')) return 'Matcha cafe with Instagram-worthy lattes and wellness vibes';
    if (name.includes('chai')) return 'Chai spot serving authentic spiced tea and trendy beverages';
    if (name.includes('tea')) return 'Tea house with specialty blends and peaceful atmosphere';
    return 'Tea shop with specialty drinks and aesthetic vibes';
  }
  
  if (config.category === 'juice_bowls') {
    if (name.includes('poke') || name.includes('poki')) return 'Fresh poke bowls with sustainable fish and trendy toppings';
    if (name.includes('acai')) return 'Acai bowl spot with superfood toppings and Instagram presentation';
    if (name.includes('juice')) return 'Juice bar with cold-pressed blends and wellness shots';
    return 'Health-focused spot with nourishing bowls and fresh ingredients';
  }
  
  if (config.category === 'pilates') {
    if (name.includes('reformer')) return 'Reformer Pilates – Aesthetic core burn with grip socks and mirrors';
    if (name.includes('pure')) return 'Pure Barre – Tiny movements, massive results, balletcore vibes';
    if (name.includes('barre')) return 'Barre classes – Ballet-inspired workouts for toning and flexibility';
    return 'Pilates studio with female-focused classes and community vibes';
  }
  
  if (config.category === 'yoga') {
    if (name.includes('hot') || name.includes('bikram')) return 'Hot Yoga – Sweat therapy in heated rooms for detox and flexibility';
    if (name.includes('gentle')) return 'Gentle Yoga – Restorative practice for stress relief and mindfulness';
    if (name.includes('vinyasa')) return 'Vinyasa Flow – Dynamic sequences linking breath and movement';
    return 'Yoga studio offering mindful movement and wellness experiences';
  }
  
  if (config.category === 'spin') {
    if (name.includes('soul')) return 'SoulCycle – High-energy cycling with motivational coaching and playlists';
    if (name.includes('flywheel')) return 'Flywheel Sports – Data-driven indoor cycling with performance tracking';
    if (name.includes('peloton')) return 'Peloton Studio – Live classes with leaderboard competition';
    return 'Spin class studio with energizing music and group motivation';
  }
  
  return 'Trendy wellness spot with aesthetic vibes and female-inspired energy';
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