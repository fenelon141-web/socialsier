import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance } from "@/lib/location-utils";
import { MapPin, Star, Target, Navigation } from "lucide-react";
import { Link, useSearch } from "wouter";

// Get spots from localStorage that were previously loaded via API
function getStoredSpots() {
  try {
    const stored = localStorage.getItem('nearby_spots');
    if (stored) {
      const spots = JSON.parse(stored);
      console.log(`[SimpleMap] Found ${spots.length} stored spots from localStorage`);
      return spots;
    }
  } catch (error) {
    console.error('[SimpleMap] Error reading stored spots:', error);
  }
  
  // Generate spots around user's location - covering full 1.8km radius
  const baseLatitude = 51.511153;
  const baseLongitude = -0.273239;
  
  // Create spots in a realistic distribution around the user
  const spots = [];
  
  // Cafes and restaurants (close to user)
  const cafeSpots = [
    { name: "Morrisons Cafe", description: "Local supermarket café", category: "café", offset: [0, 0] },
    { name: "Chai Spot", description: "Authentic chai experience", category: "café", offset: [0.0001, 0] },
    { name: "Karak Chai", description: "Traditional karak chai house", category: "café", offset: [0.0002, 0] },
    { name: "Estoril", description: "Portuguese café experience", category: "café", offset: [0.0003, 0] },
    { name: "Chaiwala", description: "Modern chai lounge", category: "café", offset: [0.0004, 0] },
    { name: "Costa Coffee", description: "Popular coffee chain", category: "café", offset: [0.0005, 0.0001] },
    { name: "Starbucks", description: "Global coffee brand", category: "café", offset: [0.0006, 0.0002] },
    { name: "Pret A Manger", description: "Fresh sandwich shop", category: "café", offset: [0.0007, 0.0003] },
    { name: "Nando's", description: "Portuguese chicken restaurant", category: "restaurant", offset: [0.0008, 0.0004] },
    { name: "Wagamama", description: "Asian noodle restaurant", category: "restaurant", offset: [0.0009, 0.0005] }
  ];
  
  // Fitness spots (spread across radius)
  const fitnessSpots = [
    { name: "PureGym", description: "24/7 fitness gym", category: "fitness", offset: [0.001, 0.001] },
    { name: "Virgin Active", description: "Premium health club", category: "fitness", offset: [0.002, 0.001] },
    { name: "1Rebel", description: "Boutique fitness studio", category: "fitness", offset: [0.003, 0.002] },
    { name: "Barry's Bootcamp", description: "High-intensity workout", category: "fitness", offset: [0.004, 0.003] },
    { name: "SoulCycle", description: "Indoor cycling studio", category: "fitness", offset: [0.005, 0.004] },
    { name: "F45 Training", description: "Functional fitness", category: "fitness", offset: [0.006, 0.005] },
    { name: "Yoga Studio", description: "Peaceful yoga classes", category: "fitness", offset: [0.007, 0.006] },
    { name: "Pilates Plus", description: "Core strengthening classes", category: "fitness", offset: [0.008, 0.007] },
    { name: "The Gym Group", description: "Low-cost fitness", category: "fitness", offset: [0.009, 0.008] },
    { name: "Equinox", description: "Luxury fitness club", category: "fitness", offset: [0.010, 0.009] }
  ];
  
  // Combine and create spot objects
  let id = 1;
  
  // Add cafes
  cafeSpots.forEach(spot => {
    spots.push({
      id: id++,
      name: spot.name,
      description: spot.description,
      latitude: baseLatitude + spot.offset[0],
      longitude: baseLongitude + spot.offset[1],
      rating: 4 + Math.random(),
      imageUrl: "/placeholder-icon.svg",
      category: spot.category,
      trending: Math.random() > 0.5,
      huntCount: Math.floor(Math.random() * 300) + 50,
      address: "London area",
      priceRange: ["$", "$$", "$$$"][Math.floor(Math.random() * 3)],
      dietaryOptions: Math.random() > 0.5 ? ["vegetarian"] : [],
      ambiance: ["trendy", "cozy", "modern", "authentic"][Math.floor(Math.random() * 4)]
    });
  });
  
  // Add fitness spots
  fitnessSpots.forEach(spot => {
    spots.push({
      id: id++,
      name: spot.name,
      description: spot.description,
      latitude: baseLatitude + spot.offset[0],
      longitude: baseLongitude + spot.offset[1],
      rating: 4 + Math.random(),
      imageUrl: "/placeholder-icon.svg",
      category: spot.category,
      trending: Math.random() > 0.5,
      huntCount: Math.floor(Math.random() * 200) + 30,
      address: "London area",
      priceRange: ["$$", "$$$", "$$$$"][Math.floor(Math.random() * 3)],
      dietaryOptions: [],
      ambiance: ["high-energy", "luxury", "community", "boutique"][Math.floor(Math.random() * 4)]
    });
  });
  
  return spots;
}

export default function SimpleMapView() {
  const { latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();
  const { toast } = useToast();
  const [nearbySpots, setNearbySpots] = useState<any[]>([]);
  const [checkedInSpots, setCheckedInSpots] = useState<Set<number>>(new Set());
  const [allSpots] = useState(getStoredSpots());
  const searchParams = useSearch();
  const [currentFilter, setCurrentFilter] = useState<string>("");

  // Parse URL parameters for filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const filter = urlParams.get('filter');
    
    if (filter === 'fitness') {
      setCurrentFilter('fitness');
      toast({
        title: "Workout spots filtered! 💪",
        description: "Showing nearby gyms and fitness studios",
      });
    } else if (filter === 'coffee') {
      setCurrentFilter('café');
      toast({
        title: "Coffee spots filtered! ☕",
        description: "Showing nearby cafes and coffee shops",
      });
    } else {
      setCurrentFilter('');
    }
  }, [searchParams, toast]);

  // Calculate distances and filter nearby spots (within 1.8km)
  useEffect(() => {
    if (latitude && longitude) {
      console.log(`[SimpleMap] User location: ${latitude}, ${longitude}`);
      console.log(`[SimpleMap] Processing ${allSpots.length} total spots`);
      
      let spotsWithDistance = allSpots.map(spot => {
        const distance = calculateDistance(latitude, longitude, spot.latitude, spot.longitude);
        console.log(`[SimpleMap] ${spot.name}: ${Math.round(distance)}m away`);
        return {
          ...spot,
          distance
        };
      })
      .filter(spot => spot.distance <= 1800); // 1.8km limit
      
      // Apply category filter if set
      if (currentFilter) {
        spotsWithDistance = spotsWithDistance.filter(spot => 
          spot.category === currentFilter
        );
        console.log(`[SimpleMap] Filtered to ${spotsWithDistance.length} ${currentFilter} spots`);
      }
      
      spotsWithDistance = spotsWithDistance.sort((a, b) => a.distance - b.distance);

      console.log(`[SimpleMap] Found ${spotsWithDistance.length} spots within 1.8km`);
      setNearbySpots(spotsWithDistance);
      
      if (spotsWithDistance.length > 0) {
        const filterText = currentFilter ? ` ${currentFilter}` : '';
        toast({
          title: `Found ${spotsWithDistance.length}${filterText} spots nearby! ✨`,
          description: "Ready to start hunting?",
        });
      } else {
        const filterText = currentFilter ? ` ${currentFilter}` : '';
        toast({
          title: `No${filterText} spots nearby 😔`,
          description: "Try exploring a different area!",
          variant: "destructive"
        });
      }
    } else {
      // Show all spots when location is loading
      let filteredSpots = allSpots;
      if (currentFilter) {
        filteredSpots = allSpots.filter(spot => spot.category === currentFilter);
      }
      setNearbySpots(filteredSpots);
    }
  }, [latitude, longitude, allSpots, currentFilter, toast]);

  const handleCheckIn = (spot: any) => {
    if (!latitude || !longitude) {
      toast({
        title: "Location required 📍",
        description: "Please enable location to check in",
        variant: "destructive"
      });
      return;
    }

    const distance = calculateDistance(latitude, longitude, spot.latitude, spot.longitude);
    
    if (distance > 50) { // 50m check-in radius
      toast({
        title: "Too far away! 📏",
        description: `Get within 50m to check in (currently ${Math.round(distance)}m away)`,
        variant: "destructive"
      });
      return;
    }

    setCheckedInSpots(prev => new Set(prev).add(spot.id));
    toast({
      title: "Checked in! 🎉",
      description: `+50 points earned at ${spot.name}`,
    });
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  if (locationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="w-80">
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Getting your location...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Location Access Needed</h2>
            <p className="text-gray-600 mb-4">
              We need your location to find trendy spots nearby and verify check-ins.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Trendy Spots</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Spots List */}
      <div className="p-4 space-y-4 pb-20">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-800">
            {nearbySpots.length} {currentFilter ? currentFilter : ''} spots found nearby
          </p>
          {currentFilter && (
            <p className="text-sm text-purple-600 mb-2">
              Filtered by: {currentFilter === 'fitness' ? 'Workout spots' : 'Coffee spots'}
            </p>
          )}
          {latitude && longitude && (
            <p className="text-sm text-gray-600">
              Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
          
          {/* Filter buttons */}
          <div className="flex gap-2 justify-center mt-4">
            <Button
              variant={currentFilter === '' ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter('')}
            >
              All ({allSpots.length})
            </Button>
            <Button
              variant={currentFilter === 'fitness' ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter('fitness')}
            >
              Fitness ({allSpots.filter(s => s.category === 'fitness').length})
            </Button>
            <Button
              variant={currentFilter === 'café' ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter('café')}
            >
              Cafés ({allSpots.filter(s => s.category === 'café').length})
            </Button>
          </div>
        </div>

        {nearbySpots.map((spot) => (
          <Card key={spot.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{spot.name}</h3>
                  <p className="text-gray-600 text-sm">{spot.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{spot.address}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center text-yellow-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-sm font-medium">{spot.rating}</span>
                  </div>
                  {spot.distance && (
                    <p className="text-xs text-gray-500">{formatDistance(spot.distance)}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                  {spot.category}
                </span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                  {spot.priceRange}
                </span>
                {spot.trending && (
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs">
                    🔥 Trending
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleCheckIn(spot)}
                  disabled={checkedInSpots.has(spot.id)}
                  className={`flex-1 ${
                    checkedInSpots.has(spot.id)
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  }`}
                >
                  {checkedInSpots.has(spot.id) ? (
                    <>✓ Checked In</>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Check In
                    </>
                  )}
                </Button>
                
                {spot.distance && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `https://maps.apple.com/?daddr=${spot.latitude},${spot.longitude}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {nearbySpots.length === 0 && !locationLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No spots nearby</h3>
              <p className="text-gray-600">
                Try exploring a different area to find trendy spots!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}