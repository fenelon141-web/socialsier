// Google Maps integration for finding trendy restaurants, cafes, and establishments
export interface GoogleMapsPlace {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  priceLevel?: number;
  types: string[];
  photos?: string[];
  formattedAddress?: string;
  businessStatus?: string;
  userRatingCount?: number;
  distance?: number;
}

export class GoogleMapsService {
  private map: google.maps.Map | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async loadGoogleMaps(): Promise<void> {
    if (window.google?.maps) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      
      document.head.appendChild(script);
    });
  }

  async initializeMap(container: HTMLElement, center: { lat: number; lng: number }): Promise<google.maps.Map> {
    await this.loadGoogleMaps();
    
    this.map = new google.maps.Map(container, {
      center,
      zoom: 15,
      styles: [
        // Valley Girl pink/purple theme
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#ffeef9" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#e8d5ff" }]
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [{ color: "#fff0f8" }]
        }
      ]
    });

    this.placesService = new google.maps.places.PlacesService(this.map);
    return this.map;
  }

  async findNearbyTrendySpots(
    location: { lat: number; lng: number },
    radius: number = 2000
  ): Promise<GoogleMapsPlace[]> {
    if (!this.placesService) {
      throw new Error('Google Maps not initialized');
    }

    // Valley Girl trendy place types
    const trendyTypes = [
      'restaurant',
      'cafe', 
      'coffee_shop',
      'bakery',
      'juice_bar',
      'meal_takeaway',
      'food'
    ];

    const allResults: GoogleMapsPlace[] = [];

    // Search for each type to get comprehensive results
    for (const type of trendyTypes) {
      try {
        const results = await this.searchNearbyPlaces(location, radius, type);
        
        // Filter for trendy, highly-rated places
        const trendyResults = results.filter(place => {
          const isTrendy = this.isTrendyPlace(place);
          const hasGoodRating = !place.rating || place.rating >= 4.0;
          const isOpen = place.businessStatus === 'OPERATIONAL' || !place.businessStatus;
          
          return isTrendy && hasGoodRating && isOpen;
        });

        allResults.push(...trendyResults);
      } catch (error) {
        
      }
    }

    // Remove duplicates and sort by rating/trendiness
    const uniqueResults = this.removeDuplicates(allResults);
    return this.sortByTrendiness(uniqueResults).slice(0, 25);
  }

  private searchNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number,
    type: string
  ): Promise<GoogleMapsPlace[]> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Places service not initialized'));
        return;
      }

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: type as any,
        rankBy: google.maps.places.RankBy.PROMINENCE
      };

      this.placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places = results.map(place => this.convertToPlace(place, location));
          resolve(places);
        } else {
          resolve([]);
        }
      });
    });
  }

  private convertToPlace(
    googlePlace: google.maps.places.PlaceResult,
    userLocation: { lat: number; lng: number }
  ): GoogleMapsPlace {
    const place: GoogleMapsPlace = {
      id: googlePlace.place_id || Math.random().toString(),
      name: googlePlace.name || 'Unknown Place',
      location: {
        lat: googlePlace.geometry?.location?.lat() || 0,
        lng: googlePlace.geometry?.location?.lng() || 0
      },
      rating: googlePlace.rating,
      priceLevel: googlePlace.price_level,
      types: googlePlace.types || [],
      formattedAddress: googlePlace.vicinity,
      businessStatus: googlePlace.business_status,
      userRatingCount: googlePlace.user_ratings_total
    };

    // Add photos
    if (googlePlace.photos && googlePlace.photos.length > 0) {
      place.photos = googlePlace.photos.map(photo => 
        photo.getUrl({ maxWidth: 400, maxHeight: 400 })
      );
    }

    // Calculate distance
    place.distance = this.calculateDistance(
      userLocation.lat,
      userLocation.lng,
      place.location.lat,
      place.location.lng
    );

    return place;
  }

  private isTrendyPlace(place: GoogleMapsPlace): boolean {
    const name = place.name.toLowerCase();
    const types = place.types.join(' ').toLowerCase();
    
    // Valley Girl trendy keywords
    const trendyKeywords = [
      'artisan', 'craft', 'organic', 'local', 'farm', 'fresh',
      'boutique', 'specialty', 'gourmet', 'matcha', 'acai',
      'juice', 'smoothie', 'avocado', 'toast', 'bowl',
      'brunch', 'aesthetic', 'instagrammable', 'cute',
      'cozy', 'chic', 'modern', 'contemporary'
    ];

    // Trendy place types
    const trendyTypes = [
      'juice_bar', 'health_food', 'organic_food',
      'coffee_shop', 'cafe', 'bakery'
    ];

    const hasTrendyKeyword = trendyKeywords.some(keyword => 
      name.includes(keyword) || types.includes(keyword)
    );

    const hasTrendyType = trendyTypes.some(type => types.includes(type));

    // Higher rating threshold for trendiness
    const hasHighRating = place.rating && place.rating >= 4.2;

    return hasTrendyKeyword || hasTrendyType || hasHighRating;
  }

  private removeDuplicates(places: GoogleMapsPlace[]): GoogleMapsPlace[] {
    const seen = new Set();
    return places.filter(place => {
      const key = `${place.name}-${place.location.lat}-${place.location.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortByTrendiness(places: GoogleMapsPlace[]): GoogleMapsPlace[] {
    return places.sort((a, b) => {
      // Prioritize by rating, then by trendiness indicators
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      
      if (ratingA !== ratingB) {
        return ratingB - ratingA; // Higher rating first
      }
      
      // If same rating, prefer places with more reviews
      const reviewsA = a.userRatingCount || 0;
      const reviewsB = b.userRatingCount || 0;
      
      if (reviewsA !== reviewsB) {
        return reviewsB - reviewsA;
      }
      
      // Finally, sort by distance
      return (a.distance || 0) - (b.distance || 0);
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  addMarker(place: GoogleMapsPlace): google.maps.Marker | null {
    if (!this.map) return null;

    const marker = new google.maps.Marker({
      position: place.location,
      map: this.map,
      title: place.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#ff69b4" stroke="#fff" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#fff"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32)
      }
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: this.createInfoWindowContent(place)
    });

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
    });

    return marker;
  }

  private createInfoWindowContent(place: GoogleMapsPlace): string {
    const rating = place.rating ? `⭐ ${place.rating}` : '';
    const price = place.priceLevel ? '$'.repeat(place.priceLevel) : '';
    const photo = place.photos?.[0] ? `<img src="${place.photos[0]}" style="width: 200px; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">` : '';
    
    return `
      <div style="max-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${photo}
        <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px;">${place.name}</h3>
        <div style="display: flex; gap: 8px; margin-bottom: 8px; font-size: 14px;">
          ${rating ? `<span style="color: #ff6b35;">${rating}</span>` : ''}
          ${price ? `<span style="color: #666;">${price}</span>` : ''}
        </div>
        <p style="margin: 0; color: #666; font-size: 12px;">${place.formattedAddress || ''}</p>
        ${place.distance ? `<p style="margin: 4px 0 0 0; color: #ff69b4; font-size: 12px; font-weight: 500;">${Math.round(place.distance)}m away</p>` : ''}
      </div>
    `;
  }
}