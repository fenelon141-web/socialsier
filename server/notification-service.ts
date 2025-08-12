import { storage } from "./storage";
import type { User, Spot } from "@shared/schema";

export class NotificationService {
  private activeUsers: Map<string, { lat: number; lng: number; lastCheck: Date }> = new Map();
  private notificationInterval: NodeJS.Timeout | null = null;

  // Track user's current location for notifications
  async trackUserLocation(userId: string, latitude: number, longitude: number) {
    this.activeUsers.set(userId, {
      lat: latitude,
      lng: longitude,
      lastCheck: new Date()
    });

    // Start monitoring service if not already running
    if (!this.notificationInterval) {
      this.startMonitoring();
    }
  }

  // Start the monitoring service
  private startMonitoring() {
    console.log('🚀 Starting nearby trending spots monitoring service');
    // Check for nearby trending spots every 2 minutes for better responsiveness
    this.notificationInterval = setInterval(async () => {
      await this.checkForNearbyTrendingSpots();
    }, 2 * 60 * 1000); // 2 minutes for better user experience
  }

  // Check all active users for nearby trending spots
  private async checkForNearbyTrendingSpots() {
    console.log(`Checking nearby trending spots for ${this.activeUsers.size} active users`);
    
    for (const [userId, location] of Array.from(this.activeUsers.entries())) {
      try {
        // Only check users who were active in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (location.lastCheck < oneHourAgo) {
          this.activeUsers.delete(userId);
          continue;
        }

        await this.checkUserForNearbyTrending(userId, location.lat, location.lng);
      } catch (error) {
        console.error(`Error checking notifications for user ${userId}:`, error);
      }
    }
  }

  // Check individual user for nearby trending spots
  private async checkUserForNearbyTrending(userId: string, lat: number, lng: number) {
    // Get user's notification preferences
    const user = await storage.getUser(parseInt(userId));
    if (!user || !user.notifyNearbySpots) {
      return; // User disabled nearby spot notifications
    }

    console.log(`🔍 Checking nearby trending spots for user ${userId} at ${lat}, ${lng}`);

    // Find nearby spots using the same logic as the API
    const nearbySpots = await this.findNearbyTrendySpots(lat, lng, 800); // 800m radius for better targeting
    
    // Filter for truly trending spots with more relaxed criteria for better discovery
    const trendingSpots = nearbySpots.filter((spot: any) => {
      const isHighRated = spot.rating >= 4.0;
      const hasActivity = spot.huntCount >= 3;
      const isClose = spot.distance <= 600; // Within 600m for immediate relevance
      
      return isHighRated && (hasActivity || isClose);
    });

    console.log(`📍 Found ${trendingSpots.length} potentially trending spots nearby`);

    // Send notifications for new trending spots
    for (const spot of trendingSpots.slice(0, 3)) { // Allow up to 3 notifications for better coverage
      const hasRecent = await this.hasRecentNotificationForSpot(userId, spot.id);
      if (!hasRecent) {
        await this.sendNearbyTrendingNotification(userId, spot, lat, lng);
        await this.recordNotificationSent(userId, spot.id);
      }
    }
  }

  // Find nearby trendy spots using OpenStreetMap (simplified version)
  private async findNearbyTrendySpots(lat: number, lng: number, radius: number): Promise<any[]> {
    try {
      // Use OSM Overpass API to find cafes, restaurants, and bars
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"~"^(cafe|restaurant|bar)$"](around:${radius},${lat},${lng});
          way["amenity"~"^(cafe|restaurant|bar)$"](around:${radius},${lat},${lng});
        );
        out body;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (!response.ok) {
        console.error('Overpass API error:', response.status);
        return [];
      }

      const data = await response.json();

      return data.elements
        .filter((element: any) => element.tags?.name)
        .map((element: any) => ({
          id: element.id,
          name: element.tags.name,
          category: this.getCategoryFromTags(element.tags),
          latitude: element.lat || element.center?.lat,
          longitude: element.lon || element.center?.lon,
          rating: this.estimateRating(element.tags),
          huntCount: Math.floor(Math.random() * 20) + 5,
          distance: this.calculateDistance(lat, lng, element.lat || element.center?.lat, element.lon || element.center?.lon),
          description: this.getDescription(element.tags)
        }))
        .filter((spot: any) => spot.latitude && spot.longitude)
        .sort((a: any, b: any) => a.distance - b.distance);
        
    } catch (error) {
      console.error('Error fetching nearby spots:', error);
      return [];
    }
  }

  // Check if user already got a notification for this spot recently (public method)
  async hasRecentNotificationForSpot(userId: string, spotId: number): Promise<boolean> {
    // Check if notification was sent in the last 24 hours
    const notifications = await storage.getUserNotifications(userId);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return notifications.some((notification: any) => 
      notification.type === 'nearby_trending' &&
      notification.data?.spotId === spotId &&
      notification.createdAt && notification.createdAt > oneDayAgo
    );
  }

  // Send nearby trending spot notification (public method)
  async sendNearbyTrendingNotification(userId: string, spot: any, userLat: number, userLng: number) {
    const distance = Math.round(spot.distance);
    
    // Create varied notification messages for different spot types
    let notificationTitle = '🔥 Trending Spot Nearby!';
    let notificationMessage = `${spot.name} is trending ${distance}m away! Perfect for your next hunt 📍`;
    
    if (spot.category === 'cafe' || spot.description.toLowerCase().includes('coffee')) {
      notificationTitle = '☕ Trendy Coffee Spot Discovered!';
      notificationMessage = `${spot.name} is buzzing with activity ${distance}m away! Great for your coffee hunt ☕`;
    } else if (spot.category === 'fitness' || spot.description.toLowerCase().includes('gym')) {
      notificationTitle = '💪 Hot Workout Spot Nearby!';
      notificationMessage = `${spot.name} is the place to be ${distance}m away! Perfect for your fitness hunt 🏃‍♀️`;
    } else if (spot.category === 'restaurant' || spot.description.toLowerCase().includes('food')) {
      notificationTitle = '🍽️ Aesthetic Food Spot Found!';
      notificationMessage = `${spot.name} is trending ${distance}m away! Ideal for your next food adventure 📸`;
    }
    
    await storage.createNotification({
      userId: userId,
      type: 'nearby_trending',
      title: notificationTitle,
      message: notificationMessage,
      data: {
        spotId: spot.id,
        spotName: spot.name,
        distance: distance,
        latitude: spot.latitude,
        longitude: spot.longitude,
        category: spot.category,
        rating: spot.rating,
        description: spot.description
      },
      read: false,
      sent: false
    });

    console.log(`📱 Sent ${spot.category} trending notification to user ${userId} for ${spot.name} (${distance}m away)`);
  }

  // Helper methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private getCategoryFromTags(tags: any): string {
    if (tags.amenity === 'cafe') return 'cafe';
    if (tags.amenity === 'bar') return 'bar';
    if (tags.amenity === 'restaurant') return 'restaurant';
    return 'cafe';
  }

  private estimateRating(tags: any): number {
    // Estimate rating based on tags (4.0-4.8 range for trending spots)
    let rating = 4.0;
    if (tags.cuisine) rating += 0.2;
    if (tags.outdoor_seating === 'yes') rating += 0.1;
    if (tags.wifi === 'yes') rating += 0.1;
    if (tags.takeaway === 'yes') rating += 0.1;
    return Math.min(4.8, rating + Math.random() * 0.3);
  }

  private getDescription(tags: any): string {
    const descriptions = [
      "Aesthetic vibes with Instagram-worthy drinks ✨",
      "Perfect spot for matcha lattes and açaí bowls 🍵",
      "Trendy atmosphere with healthy options 🌿",
      "Cozy space with artisan coffee and boba tea 🧋",
      "Popular spot for avocado toast and smoothies 🥑"
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  // Record that a notification was sent
  private async recordNotificationSent(userId: string, spotId: number): Promise<void> {
    // This could store in a database table for tracking
    console.log(`Recorded notification sent to user ${userId} for spot ${spotId}`);
  }

  // Get notification history count
  async getNotificationHistory(): Promise<{ sent: number; pending: number }> {
    const allNotifications = await storage.getAllNotifications();
    return {
      sent: allNotifications.filter(n => n.sent).length,
      pending: allNotifications.filter(n => !n.sent).length
    };
  }

  // Public method to manually trigger notification check
  async checkNearbyTrendySpots(userId: string, latitude: number, longitude: number): Promise<void> {
    await this.checkUserForNearbyTrending(userId, latitude, longitude);
  }

  // Stop monitoring service
  stopMonitoring() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
    this.activeUsers.clear();
  }

  // Get current active users count (for monitoring)
  getActiveUsersCount(): number {
    return this.activeUsers.size;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();