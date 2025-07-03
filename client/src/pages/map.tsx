import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import SpotCard from "@/components/spot-card";
import LeafletMap from "@/components/leaflet-map";
import { useGeolocation } from "@/hooks/use-geolocation";
import { ArrowLeft, MapPin, Star, Target, Navigation } from "lucide-react";
import { Link } from "wouter";
import type { Spot } from "@shared/schema";

export default function MapView() {
  const { latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();
  
  // Get nearby spots from Google Places API based on current location
  const { data: nearbySpots, isLoading: spotsLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots/nearby", latitude, longitude],
    queryFn: async () => {
      if (!latitude || !longitude) return [];
      const response = await fetch(`/api/spots/nearby?lat=${latitude}&lng=${longitude}&radius=2000`);
      return response.json();
    },
    enabled: !!latitude && !!longitude,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fallback to stored spots if location is not available
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

      {/* Google Maps Integration */}
      <div className="relative border-b">
        {locationLoading ? (
          <div className="h-64 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="w-12 h-12 text-pink-400 mx-auto mb-2 animate-spin" />
              <p className="text-gray-600 text-sm">Finding your location...</p>
              <p className="text-xs text-gray-500">Pokemon Go-style tracking starting</p>
            </div>
          </div>
        ) : locationError ? (
          <div className="h-64 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Location permission needed</p>
              <p className="text-xs text-gray-500">Enable location for nearby trendy spots</p>
            </div>
          </div>
        ) : latitude && longitude ? (
          <LeafletMap 
            center={{ lat: latitude, lng: longitude }}
            spots={spots}
            onSpotClick={(spot) => {
              console.log('Spot clicked:', spot);
            }}
          />
        ) : (
          <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Waiting for location...</p>
            </div>
          </div>
        )}
        
        {/* Location status overlay */}
        {latitude && longitude && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700">
                Location Active
              </span>
            </div>
          </div>
        )}
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
