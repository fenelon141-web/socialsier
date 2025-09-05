import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import SearchFilters from "@/components/search-filters";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance, formatDistance } from "@/lib/location-utils";
import { ArrowLeft, MapPin, Star, Target, Navigation, Bookmark, BookmarkCheck } from "lucide-react";
import { Link, useSearch } from "wouter";
import type { Spot } from "@shared/schema";
import { API_BASE_URL, isCapacitor } from "@/config";

const LeafletMap = lazy(() => import("@/components/leaflet-map"));

export default function MapView() {
  const geoLocation = useGeolocation();
  const { latitude, longitude, loading: locationLoading, error: locationError } = geoLocation;

  const [searchFilters, setSearchFilters] = useState({});
  const { saveSpot, isSaved, savedSpots, isOnline } = useOfflineStorage();
  const { toast } = useToast();
  const searchParams = useSearch();

  const [nearbySpots, setNearbySpots] = useState<Spot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [nearbyError, setNearbyError] = useState<Error | null>(null);

  // --- URL filters ---
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const filter = urlParams.get("filter");
    const search = urlParams.get("search");

    if (filter === "coffee") {
      setSearchFilters({ category: "cafe", dietary: "coffee" });
      toast({ title: "Coffee spots filtered! ☕", description: "Showing nearby coffee spots and cafes" });
    } else if (filter === "fitness") {
      setSearchFilters({ category: "fitness" });
      toast({ title: "Workout spots filtered! 💪", description: "Showing nearby gyms and fitness studios" });
    } else if (search) {
      setSearchFilters({ search: search.toLowerCase() });
      toast({ title: `Searching for "${search}" 🔍`, description: "Finding spots that match your search" });
    }
  }, [searchParams, toast]);

  // --- Fetch spots ---
  const fetchRealTimeSpots = async (lat: number, lng: number) => {
    setSpotsLoading(true);
    setNearbyError(null);

    try {
      const apiUrl = `${API_BASE_URL}/api/spots?lat=${lat}&lng=${lng}&radius=1800&limit=25`;
      console.log(`[API] Fetching spots from: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        credentials: isCapacitor ? "omit" : "include",
      });

      if (!response.ok) throw new Error(`API responded with status ${response.status}`);

      const spots = await response.json();
      setNearbySpots(spots);
      setSpotsLoading(false);

      if (spots.length > 0) toast({ title: `Found ${spots.length} trendy spots`, description: "Chai, matcha, poki bowls, acai, pilates & more" });
    } catch (error) {
      console.error("[API Error]", error);

      // Fallback to embedded spots
      try {
        const { embeddedValleyGirlSpots } = await import("../data/embedded-spots");
        setNearbySpots(embeddedValleyGirlSpots);
        setSpotsLoading(false);
        toast({ title: "Using offline data", description: "Enable internet connection for real-time spots near you" });
      } catch {
        setNearbyError(new Error("Unable to load spots - check connection and location permissions"));
        setSpotsLoading(false);
      }
    }
  };

  // --- Fetch spots on location update ---
  useEffect(() => {
    if (!latitude || !longitude || locationLoading) return;

    if (locationError) {
      setSpotsLoading(false);
      setNearbyError(new Error(typeof locationError === "string" ? locationError : "Location error"));
      return;
    }

    fetchRealTimeSpots(latitude, longitude);
  }, [latitude, longitude, locationLoading, locationError, searchFilters]);

  // --- Memoize spots with distance ---
  const spots = useMemo(() => {
    return (nearbySpots || [])
      .map((spot) => ({
        ...spot,
        distance: spot.distance || (latitude && longitude ? Math.round(calculateDistance(latitude, longitude, spot.latitude, spot.longitude)) : 0),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [nearbySpots, latitude, longitude]);

  const isLoading = spotsLoading;

  // --- Save spot ---
  const handleSaveSpot = (spot: Spot) => {
    const success = saveSpot({ ...spot });
    if (success) toast({ title: "Spot Saved! 📍", description: `${spot.name} is now available offline` });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 to-purple-300 p-4 text-white flex items-center space-x-3">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Spot Map 🗺️</h1>
          <p className="text-xs opacity-90">Discover trendy spots near you ✨</p>
        </div>
      </div>

      {/* Map */}
      <div className="relative border-b">
        {locationLoading ? (
          <div className="h-64 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
            <Navigation className="w-12 h-12 text-pink-400 animate-spin" />
            <p className="text-gray-600 text-sm">Finding your location...</p>
          </div>
        ) : locationError || !latitude || !longitude ? (
          <div className="h-64 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-red-400" />
            <p className="text-gray-600 text-sm">Location needed</p>
          </div>
        ) : (
          <Suspense fallback={<div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center"><MapPin className="w-8 h-8 text-pink-400 animate-pulse" /><p className="text-gray-600 text-sm">Loading map...</p></div>}>
            <LeafletMap center={{ lat: latitude, lng: longitude }} spots={spots} onSpotClick={() => {}} />
          </Suspense>
        )}
      </div>

      {/* Spot list */}
      <div className="p-4 space-y-4 pb-20">
        <SearchFilters onFiltersChange={setSearchFilters} />

        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : spots.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No spots found nearby</p>
          </div>
        ) : (
          spots.slice(0, 15).map((spot) => {
            const distance = latitude && longitude ? calculateDistance(latitude, longitude, spot.latitude, spot.longitude) : null;
            return (
              <Card key={spot.id} className="card-gradient rounded-xl shadow-lg border-0">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800">{spot.name}</h3>
                      {distance !== null && (
                        <div className="flex items-center space-x-1 bg-gradient-to-r from-pink-100 to-purple-100 px-2 py-1 rounded-full">
                          <Target className="w-3 h-3 text-pink-600" />
                          <span className="text-xs text-pink-700">{formatDistance(distance)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{spot.description}</p>
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
                    <Button size="sm" variant="outline" onClick={() => handleSaveSpot(spot)} disabled={isSaved(spot.id)} className={`text-xs px-3 py-1 ${isSaved(spot.id) ? "bg-green-50 text-green-700 border-green-200" : "hover:bg-pink-50"}`}>
                      {isSaved(spot.id) ? <><BookmarkCheck className="w-3 h-3 mr-1" />Saved</> : <><Bookmark className="w-3 h-3 mr-1" />Save</>}
                    </Button>
                    <Button size="sm" onClick={() => {
                      if (latitude && longitude) {
                        const spotQuery = encodeURIComponent(spot.name);
                        window.open(`https://www.google.com/maps/search/${spotQuery}`, "_blank");
                        toast({ title: "Opening navigation", description: `Getting directions to ${spot.name}` });
                      }
                    }} className="text-xs px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                      <Navigation className="w-3 h-3 mr-1" />Go
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
