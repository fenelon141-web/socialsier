import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/top-navigation";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, MapPin, Camera, Flame, Plus, Star, Trophy, Navigation } from "lucide-react";
import { Link } from "wouter";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useLocation } from "@/hooks/use-location";
import type { Spot, UserBadge, Badge as BadgeType, User } from "@shared/schema";

interface InstagramPost {
  id: string;
  type: 'spot' | 'nearby' | 'workout';
  user: {
    username: string;
    avatar: string;
  };
  content: string;
  location: string;
  image: string;
  rating?: number;
  category?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  spot?: Spot;
}

export default function Home() {
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const { city, country, loading: locationNameLoading } = useLocation();
  
  const { data: trendingSpots, isLoading: spotsLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots/trending"]
  });

  const { data: nearbySpots, isLoading: nearbyLoading } = useQuery({
    queryKey: ["/api/spots/nearby", latitude, longitude],
    queryFn: async () => {
      const response = await fetch(`https://hot-girl-hunt-fenelon141.replit.app/api/spots/nearby?lat=${latitude}&lng=${longitude}`, {

      return response.json();
    },
    enabled: !!(latitude && longitude),
  });

  const { data: userBadges, isLoading: badgesLoading } = useQuery<(UserBadge & { badge: BadgeType })[]>({
    queryKey: ["/api/user/1/badges"]
  });

  const { data: gymClasses, isLoading: gymLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots/gym", latitude, longitude],
    queryFn: async () => {
      const response = await fetch(`https://hot-girl-hunt-fenelon141.replit.app/api/spots/gym?lat=${latitude}&lng=${longitude}&r`, {

        const response = await fetch(`/api/spots/gym?lat=${latitude}&lng=${longitude}&radius=3000`);
        return response.json();
      } else {
        const response = await fetch('/api/spots/gym');
        return response.json();
      }
    }
  });

  const { data: activity } = useQuery<any[]>({
    queryKey: ["/api/activity"]
  });

  const { data: userStats } = useQuery<any>({
    queryKey: ["/api/user/1/stats"]
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/user/1"]
  });

  const { data: friends } = useQuery<User[]>({
    queryKey: ["/api/user/1/friends"]
  });

  // Create Instagram-style posts from spots and activities
  const createInstagramPosts = (): InstagramPost[] => {
    const posts: InstagramPost[] = [];

    // Add trending spots as posts
    if (trendingSpots?.length) {
      trendingSpots.slice(0, 3).forEach((spot: Spot) => {
        posts.push({
          id: `spot-${spot.id}`,
          type: 'spot',
          user: {
            username: 'IYKYK',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
          },
          content: `Check out this trending spot! ${spot.description || 'Perfect for your next aesthetic moment ✨'}`,
          location: spot.name,
          image: spot.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop',
          rating: spot.rating,
          category: spot.category,
          likes: Math.floor(Math.random() * 50) + 20,
          comments: Math.floor(Math.random() * 15) + 5,
          timeAgo: `${Math.floor(Math.random() * 12) + 1}h`,
          spot: spot
        });
      });
    }

    // Add nearby spots as posts
    if (nearbySpots?.length) {
      nearbySpots.slice(0, 2).forEach((spot: Spot) => {
        posts.push({
          id: `nearby-${spot.id}`,
          type: 'nearby',
          user: {
            username: 'Nearby Vibes',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face'
          },
          content: `Found this gem nearby! Only ${Math.floor(spot.distance || 500)}m away ${spot.description || 'Perfect for a quick coffee run ☕'}`,
          location: spot.name,
          image: spot.imageUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop',
          rating: spot.rating,
          category: spot.category,
          likes: Math.floor(Math.random() * 30) + 10,
          comments: Math.floor(Math.random() * 8) + 2,
          timeAgo: `${Math.floor(Math.random() * 6) + 1}h`,
          spot: spot
        });
      });
    }

    // Add gym classes as posts
    if (gymClasses?.length) {
      gymClasses.slice(0, 2).forEach((spot: Spot) => {
        posts.push({
          id: `gym-${spot.id}`,
          type: 'workout',
          user: {
            username: 'Hot Girl Workouts',
            avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=40&h=40&fit=crop&crop=face'
          },
          content: `Time for that hot girl workout! ${spot.description || 'Get ready to sweat and feel amazing 💪'}`,
          location: spot.name,
          image: spot.imageUrl || 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop',
          rating: spot.rating,
          category: spot.category,
          likes: Math.floor(Math.random() * 40) + 25,
          comments: Math.floor(Math.random() * 12) + 8,
          timeAgo: `${Math.floor(Math.random() * 8) + 1}h`,
          spot: spot
        });
      });
    }

    return posts.sort(() => Math.random() - 0.5); // Shuffle posts
  };

  const instagramPosts = createInstagramPosts();

  return (
    <div className="min-h-screen bg-white">
      <TopNavigation />
      
      <div className="pb-20">
        {/* Header with Location */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-pink-500" />
              <span className="text-sm text-gray-600">
                {locationNameLoading ? "Finding your location..." : 
                 city && country ? `${city}, ${country}` : "Location unknown"}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gradient-to-r from-pink-100 to-purple-100 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-semibold text-gray-800">
                  Level {currentUser?.level || 1}
                </span>
              </div>
              <Button size="sm" variant="ghost" className="p-2">
                <Camera className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stories Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {/* Your Story */}
            <div className="flex flex-col items-center space-y-2 min-w-[70px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 p-0.5">
                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"}
                    alt="Your story"
                    className="w-full h-full rounded-full border-2 border-white object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <span className="text-xs text-gray-700 font-medium">Your Story</span>
            </div>

            {/* Friends' Stories */}
            {friends?.slice(0, 8).map((friend, index) => (
              <div key={friend.id} className="flex flex-col items-center space-y-2 min-w-[70px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 p-0.5">
                  <img
                    src={friend.avatar || `https://images.unsplash.com/photo-${1494790108755 + index}?w=60&h=60&fit=crop&crop=face`}
                    alt={friend.username}
                    className="w-full h-full rounded-full border-2 border-white object-cover"
                  />
                </div>
                <span className="text-xs text-gray-700 truncate w-full text-center">
                  {friend.username}
                </span>
              </div>
            ))}

            {/* Discover More */}
            <div className="flex flex-col items-center space-y-2 min-w-[70px]">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-xs text-gray-500">Discover</span>
            </div>
          </div>
        </div>

        {/* Instagram-style Feed */}
        <div className="space-y-0">
          {instagramPosts.length === 0 ? (
            <div className="p-8 text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Start exploring spots near you to see your feed come alive!</p>
              <Link href="/map">
                <Button className="bg-gradient-to-r from-pink-400 to-purple-500 text-white">
                  Explore Map
                </Button>
              </Link>
            </div>
          ) : (
            instagramPosts.map((post) => (
              <Card key={post.id} className="rounded-none border-0 border-b border-gray-100">
                <CardContent className="p-0">
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.user.avatar}
                        alt={post.user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-gray-800">{post.user.username}</span>
                          {post.type === 'spot' && (
                            <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                              Trending
                            </Badge>
                          )}
                          {post.type === 'nearby' && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              Near You
                            </Badge>
                          )}
                          {post.type === 'workout' && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                              Workout
                            </Badge>
                          )}
                        </div>
                        {post.location && (
                          <p className="text-xs text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {post.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{post.timeAgo}</span>
                  </div>

                  {/* Post Image */}
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.location}
                      className="w-full h-80 object-cover"
                    />
                    {post.rating && (
                      <div className="absolute top-3 right-3 bg-black bg-opacity-50 rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-white font-medium">{post.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-gray-700 hover:text-pink-500 transition-colors">
                          <Heart className="w-6 h-6" />
                        </button>
                        <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-6 h-6" />
                        </button>
                        <button className="flex items-center space-x-2 text-gray-700 hover:text-green-500 transition-colors">
                          <Share2 className="w-6 h-6" />
                        </button>
                      </div>
                      {post.spot && (
                        <Link href="/map">
                          <Button size="sm" variant="ghost" className="text-pink-500 hover:text-pink-600">
                            <Navigation className="w-4 h-4 mr-1" />
                            Go
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Like Count */}
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      {post.likes} likes
                    </p>

                    {/* Post Content */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{post.user.username}</span> {post.content}
                      </p>
                      
                      {post.category && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs text-blue-600 font-medium">
                            #{post.category.toLowerCase().replace(/\s+/g, '')}
                          </span>
                          <span className="text-xs text-blue-600 font-medium">#iykyk</span>
                          <span className="text-xs text-blue-600 font-medium">#hotgirlmoments</span>
                        </div>
                      )}

                      {post.comments > 0 && (
                        <button className="text-sm text-gray-500 mt-1">
                          View all {post.comments} comments
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions Floating Button */}
        <div className="fixed bottom-24 right-4 z-10">
          <Link href="/map">
            <Button
              size="lg"
              className="rounded-full w-14 h-14 bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}