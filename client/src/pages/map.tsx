import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import SpotCard from "@/components/spot-card";
import SearchFilters from "@/components/search-filters";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance, formatDistance } from "@/lib/location-utils";
// WebSocket spots functionality removed due to connection conflicts
import { ArrowLeft, MapPin, Star, Target, Navigation, Bookmark, BookmarkCheck } from "lucide-react";
import { Link, useSearch } from "wouter";
import type { Spot } from "@shared/schema";

// Lazy load the map component for better initial page performance
const LeafletMap = lazy(() => import("@/components/leaflet-map"));



export default function MapView() {
  const geoLocation = useGeolocation();
  const { latitude, longitude, loading: locationLoading, error: locationError } = geoLocation;
  

  const [searchFilters, setSearchFilters] = useState({});
  const { saveSpot, isSaved, savedSpots, isOnline } = useOfflineStorage();
  const { toast } = useToast();
  const searchParams = useSearch();

  // Parse URL parameters and set initial filters
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const filter = urlParams.get('filter');
    const search = urlParams.get('search');
    
    if (filter === 'coffee') {
      setSearchFilters({ category: 'cafe', dietary: 'coffee' });
      toast({
        title: "Coffee spots filtered! ☕",
        description: "Showing nearby coffee spots and cafes",
      });
    } else if (filter === 'fitness') {
      setSearchFilters({ category: 'fitness' });
      toast({
        title: "Workout spots filtered! 💪",
        description: "Showing nearby gyms and fitness studios",
      });
    } else if (search) {
      setSearchFilters({ search: search.toLowerCase() });
      toast({
        title: `Searching for "${search}" 🔍`,
        description: "Finding spots that match your search",
      });
    }
  }, [searchParams, toast]);
  
  // Real-time spots fetching with iOS compatibility
  const [nearbySpots, setNearbySpots] = useState<Spot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [nearbyError, setNearbyError] = useState<Error | null>(null);
  
  // iOS-compatible spots fetching with fallback to embedded data
  const fetchRealTimeSpots = async (lat: number, lng: number) => {
    setSpotsLoading(true);
    setNearbyError(null);
    
    // iOS fallback: Use embedded spots immediately for native apps
    const isIOSNative = (window as any).Capacitor?.isNativePlatform() || 
                        (window as any).Capacitor?.platform === 'ios' ||
                        window.navigator.userAgent.includes('iPhone');
    
    if (isIOSNative) {
      try {
        const { embeddedValleyGirlSpots } = await import('../data/embedded-spots');
        setNearbySpots(embeddedValleyGirlSpots);
        setSpotsLoading(false);
        return;
      } catch (error) {
        setNearbyError(new Error('Failed to load embedded spots'));
        setSpotsLoading(false);
        return;
      }
    }
    
    try {
      // Web browser API call
      const apiUrl = `/api/spots?lat=${lat}&lng=${lng}&radius=1800&limit=25`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const spots = await response.json();
      setNearbySpots(spots);
      setSpotsLoading(false);
      
    } catch (error) {
      setNearbyError(new Error('Unable to load spots - server error'));
      setSpotsLoading(false);
    }
  };

  // Location-based spots fetching
  useEffect(() => {
    if (locationLoading) {
      return;
    }
    
    // Handle location errors
    if (locationError && !latitude && !longitude) {
      setSpotsLoading(false);
      setNearbyError(new Error(typeof locationError === 'string' ? locationError : 'Location error'));
      return;
    }
    
    if (!latitude || !longitude) {
      return;
    }
    

    fetchRealTimeSpots(latitude, longitude);
  }, [latitude, longitude, searchFilters]);

  // Disable HTTP fallback since we're using WebSocket
  const allSpots: Spot[] = [];
  const allSpotsLoading = false;

  // Memoize spots processing for performance
  const spots = useMemo(() => {
    const currentSpots = nearbySpots || allSpots || [];
    
    // Add calculated distances if missing and sort by distance
    const processedSpots = currentSpots
      .map((spot: any) => ({
        ...spot,
        distance: spot.distance || (
          latitude && longitude 
            ? Math.round(calculateDistance(latitude, longitude, spot.latitude, spot.longitude))
            : 0
        )
      }))
      .sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
    
    return processedSpots;
  }, [nearbySpots, allSpots, latitude, longitude, locationError]);

  const isLoading = spotsLoading || allSpotsLoading;
  

  
  // Handle saving spots for offline access
  const handleSaveSpot = (spot: Spot) => {
    const success = saveSpot({
      id: spot.id,
      name: spot.name,
      description: spot.description,
      latitude: spot.latitude,
      longitude: spot.longitude,
      rating: spot.rating,
      imageUrl: spot.imageUrl,
      category: spot.category
    });
    
    if (success) {
      toast({
        title: "Spot Saved! 📍",
        description: `${spot.name} is now available offline`,
      });
    }
  };

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
          <Suspense fallback={
            <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-pink-400 mx-auto mb-2 animate-pulse" />
                <p className="text-gray-600 text-sm">Loading map...</p>
              </div>
            </div>
          }>
            <LeafletMap 
              center={{ lat: latitude, lng: longitude }}
              spots={spots}
              onSpotClick={(spot) => {
                // Handle spot selection
              }}
            />
          </Suspense>
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

        {/* Search Filters */}
        <SearchFilters onFiltersChange={setSearchFilters} />

        {/* Offline Saved Spots Section */}
        {!isOnline && savedSpots.length > 0 && (
          <Card className="bg-yellow-50 border border-yellow-200 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Offline Spots</h3>
                  <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded-full">
                    {savedSpots.length} saved
                  </span>
                </div>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                You have access to {savedSpots.length} saved spots while offline
              </p>
              <div className="flex space-x-2 overflow-x-auto">
                {savedSpots.slice(0, 3).map((spot) => (
                  <div key={spot.id} className="flex-shrink-0 bg-white rounded-lg p-2 min-w-32">
                    <h4 className="text-xs font-medium text-gray-800 truncate">{spot.name}</h4>
                    <p className="text-xs text-gray-500">{spot.category}</p>
                  </div>
                ))}
                {savedSpots.length > 3 && (
                  <div className="flex-shrink-0 bg-white rounded-lg p-2 min-w-16 flex items-center justify-center">
                    <span className="text-xs text-gray-500">+{savedSpots.length - 3}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {locationError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              📍 Location permission needed for nearby spots and check-ins
            </p>
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            // Loading skeleton for better perceived performance
            [1, 2, 3].map(i => (
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
          ) : !spots || spots.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No spots found nearby</p>
              <p className="text-xs text-gray-400">
                {!latitude || !longitude ? 'Location needed for spot discovery' : 'Try expanding your search radius'}
              </p>
              {nearbyError && (
                <p className="text-xs text-red-500 mt-2">
                  Error: {nearbyError.message}
                </p>
              )}

            </div>
          ) : (
            // Limit to top 15 spots for better performance
            spots?.slice(0, 15).map((spot) => {
              const distance = latitude && longitude ? 
                calculateDistance(latitude, longitude, spot.latitude, spot.longitude) : null;
              
              return (
                <Card key={spot.id} className="card-gradient rounded-xl shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800">{spot.name}</h3>
                          {distance !== null && (
                            <div className="flex items-center space-x-1 bg-gradient-to-r from-pink-100 to-purple-100 px-2 py-1 rounded-full">
                              <Target className="w-3 h-3 text-pink-600" />
                              <span className="text-xs font-medium text-pink-700">
                                {formatDistance(distance)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {spot.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-500 ml-1">{spot.rating}</span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{spot.category}</span>
                        </div>
                      </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveSpot(spot)}
                        disabled={isSaved(spot.id)}
                        className={`text-xs px-3 py-1 ${
                          isSaved(spot.id) 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'hover:bg-pink-50'
                        }`}
                      >
                        {isSaved(spot.id) ? (
                          <>
                            <BookmarkCheck className="w-3 h-3 mr-1" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3 h-3 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (latitude && longitude) {
                            // Use spot name for better routing instead of coordinates
                            const spotQuery = encodeURIComponent(spot.name);
                            const mapUrl = `https://www.google.com/maps/search/${spotQuery}`;
                            window.open(mapUrl, '_blank');
                            
                            toast({
                              title: "Opening navigation",
                              description: `Getting directions to ${spot.name}`,
                            });
                          }
                        }}
                        className="text-xs px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Go
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
