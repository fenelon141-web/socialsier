import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/top-navigation";
import DailyChallenge from "@/components/daily-challenge";
import SpotCard from "@/components/spot-card";
import BadgeCard from "@/components/badge-card";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Camera, Navigation } from "lucide-react";
import { Link } from "wouter";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useLocation } from "@/hooks/use-location";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { apiRequest } from "@/lib/queryClient";
import type { Spot, UserBadge, Badge, Reward } from "@shared/schema";

export default function Home() {
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const { city, country, loading: locationNameLoading } = useLocation();
  const { testNearby, isTracking, serviceStatus } = usePushNotifications();
  
  const { data: trendingSpots, isLoading: spotsLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots/trending"]
  });

  // Get nearby spots when location is available
  const { data: nearbySpots, isLoading: nearbyLoading } = useQuery({
    queryKey: ["/api/spots/nearby", latitude, longitude],
    queryFn: async () => {
      const response = await fetch(`/api/spots/nearby?lat=${latitude}&lng=${longitude}&radius=1000`);
      return response.json();
    },
    enabled: !!(latitude && longitude),
  });

  const { data: userBadges, isLoading: badgesLoading } = useQuery<(UserBadge & { badge: Badge })[]>({
    queryKey: ["/api/user/1/badges"]
  });

  const { data: gymClasses, isLoading: gymLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots/gym"]
  });

  const { data: rewards } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"]
  });

  const { data: activity } = useQuery<any[]>({
    queryKey: ["/api/activity"]
  });

  const recentBadges = userBadges?.slice(-4) || [];

  return (
    <div className="min-h-screen bg-white">
      <TopNavigation />
      <DailyChallenge />
      
      <div className="p-4 space-y-4 pb-20">
        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Link href="/map" asChild>
            <Button className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 rounded-2xl font-semibold text-sm shadow-lg glow-effect">
              <MapPin className="w-4 h-4 mr-2" />
              🗺️ Explore Map
            </Button>
          </Link>
          <Link href="/social" asChild>
            <Button className="flex-1 bg-gradient-to-r from-emerald-300 to-purple-200 text-gray-800 py-3 rounded-2xl font-semibold text-sm shadow-lg">
              <Camera className="w-4 h-4 mr-2" />
              📸 Check In
            </Button>
          </Link>
        </div>

        {/* Push Notification Test */}
        {latitude && longitude && (
          <Card className="card-gradient rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800">Push Notifications 🔔</h2>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  serviceStatus?.isRunning ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {serviceStatus?.isRunning ? 'Active' : 'Inactive'}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Test the push notification system for nearby trending spots.
              </p>
              <Button
                onClick={() => testNearby(latitude, longitude)}
                disabled={isTracking}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-400 text-white py-2 rounded-xl font-semibold text-sm"
              >
                {isTracking ? 'Testing...' : 'Test Nearby Notifications'}
              </Button>
              {serviceStatus && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {serviceStatus.activeUsers} users currently being tracked
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Nearby Spots */}
        {nearbySpots && nearbySpots.length > 0 && (
          <Card className="card-gradient rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800">Nearby Spots 📍</h2>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                  {nearbySpots.length} found
                </span>
              </div>
              
              <div className="space-y-3">
                {nearbySpots.slice(0, 5).map((spot: any) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Loading State */}
        {locationLoading && (
          <Card className="card-gradient rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800">Finding Nearby Spots 🔍</h2>
                <Navigation className="w-4 h-4 animate-spin" />
              </div>
              <p className="text-sm text-gray-600">Getting your location to find spots near you...</p>
            </CardContent>
          </Card>
        )}

        {/* Trending Spots */}
        <Card className="card-gradient rounded-2xl shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">Trending RN 🔥</h2>
              <span className="text-xs bg-valley-pink text-white px-2 py-1 rounded-full">Live</span>
            </div>
            
            <div className="space-y-3">
              {spotsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl p-3 shadow-md animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                trendingSpots?.map(spot => (
                  <SpotCard key={spot.id} spot={spot} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hot Girl Workouts */}
        <Card className="card-gradient rounded-2xl shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">Hot Girl Workouts 💪</h2>
              <span className="text-xs bg-valley-coral text-white px-2 py-1 rounded-full">Trending</span>
            </div>
            
            <div className="space-y-3">
              {gymLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-xl p-3 shadow-md animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                gymClasses?.slice(0, 2).map(gym => (
                  <SpotCard key={gym.id} spot={gym} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Badges */}
        {recentBadges.length > 0 && (
          <Card className="card-gradient rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Latest Badges 🏆</h2>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {badgesLoading ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-shrink-0 bg-white rounded-xl p-3 text-center shadow-md min-w-[80px] animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                  ))
                ) : (
                  recentBadges.map(userBadge => (
                    <BadgeCard key={userBadge.id} userBadge={userBadge} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rewards Section */}
        {rewards && rewards.length > 0 && (
          <Card className="card-gradient rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800">Rewards 🎁</h2>
                <span className="text-xs bg-valley-gold text-gray-800 px-2 py-1 rounded-full font-semibold">
                  {rewards?.length || 0} Available
                </span>
              </div>
              
              <div className="space-y-2">
                {rewards?.map(reward => (
                  <div key={reward.id} className="bg-white rounded-xl p-3 border border-yellow-300 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-valley-gold rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {reward.discountPercent ? `${reward.discountPercent}%` : 'BOGO'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{reward.title}</p>
                          <p className="text-xs text-gray-600">{reward.description}</p>
                        </div>
                      </div>
                      <Button className="bg-valley-pink text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Claim
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Friends Activity */}
        {activity && activity.length > 0 && (
          <Card className="card-gradient rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Squad Activity 👯‍♀️</h2>
              <div className="space-y-3">
                {activity?.map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img 
                      src={item.friend.avatar} 
                      alt={item.friend.name}
                      className="w-10 h-10 rounded-full border-2 border-pink-400"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{item.friend.name}</span> {item.action}
                      </p>
                      <p className="text-xs text-gray-600">{item.timestamp}</p>
                    </div>
                    <div className="text-right">
                      {item.badge ? (
                        <div className="text-xs bg-valley-gold text-gray-800 px-2 py-1 rounded-full">🏆 Badge</div>
                      ) : (
                        <div className="text-xs bg-valley-mint text-gray-800 px-2 py-1 rounded-full">+{item.points} XP</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
