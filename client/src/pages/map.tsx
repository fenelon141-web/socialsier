import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import SpotCard from "@/components/spot-card";
import { useGeolocation } from "@/hooks/use-geolocation";
import { ArrowLeft, MapPin, Star, Target, Navigation } from "lucide-react";
import { Link } from "wouter";
import type { Spot } from "@shared/schema";

export default function MapView() {
  const { latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();
  
  // Get nearby spots based on current location
  const { data: nearbySpots, isLoading: spotsLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots/nearby", latitude, longitude],
    queryFn: async () => {
      if (!latitude || !longitude) return [];
      const response = await fetch(`/api/spots/nearby?lat=${latitude}&lng=${longitude}&radius=5000`);
      return response.json();
    },
    enabled: !!latitude && !!longitude
  });

  // Fallback to all spots if location is not available
  const { data: allSpots, isLoading: allSpotsLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots"],
    enabled: !latitude || !longitude
  });

  const spots = nearbySpots || allSpots || [];
  const isLoading = spotsLoading || allSpotsLoading;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 to-purple-300 p-4 text-white">
        <div className="flex items-center space-x-3">
          <Link href="/" asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Spot Map 🗺️</h1>
            <p className="text-xs opacity-90">Discover trendy spots near you ✨</p>
          </div>
        </div>
      </div>

      {/* Map Area with Location Status */}
      <div className="relative h-64 bg-gradient-to-br from-green-100 to-blue-100 border-b">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {locationLoading ? (
              <>
                <Navigation className="w-12 h-12 text-pink-400 mx-auto mb-2 animate-spin" />
                <p className="text-gray-600 text-sm">Finding your location...</p>
              </>
            ) : locationError ? (
              <>
                <MapPin className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Location unavailable</p>
                <p className="text-xs text-gray-500">Showing all spots</p>
              </>
            ) : (
              <>
                <MapPin className="w-12 h-12 text-pink-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Interactive map would go here</p>
                <p className="text-xs text-gray-500">
                  {latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Location found"}
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Dynamic spot markers based on nearby spots */}
        {spots.slice(0, 3).map((spot, index) => (
          <div 
            key={spot.id}
            className={`absolute ${
              index === 0 ? "top-16 left-12" : 
              index === 1 ? "top-32 right-16" : 
              "bottom-16 left-1/2 transform -translate-x-1/2"
            }`}
          >
            <div className={`w-6 h-6 ${
              index === 0 ? "bg-pink-400" : 
              index === 1 ? "bg-purple-400" : 
              "bg-yellow-400"
            } rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
              index === 0 ? "animate-bounce-slow" : ""
            }`}>
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Spots List */}
      <div className="p-4 space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {latitude && longitude ? "Nearby Spots 📍" : "All Spots 🗺️"}
          </h2>
          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
            {spots?.length || 0} spots found
          </span>
        </div>

        {locationError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              📍 Location permission needed for nearby spots and check-ins
            </p>
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            [1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : spots?.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No spots found nearby</p>
              <p className="text-xs text-gray-400">Try expanding your search radius</p>
            </div>
          ) : (
            spots?.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
