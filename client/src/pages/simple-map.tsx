import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance } from "@/lib/location-utils";
import { MapPin, Star, Target, Navigation } from "lucide-react";
import { Link } from "wouter";

// Static trendy spots near London - no API calls needed
const TRENDY_SPOTS = [
  {
    id: 1,
    name: "Attendant Coffee",
    description: "Victorian toilet-turned-coffee shop",
    latitude: 51.5174,
    longitude: -0.1426,
    rating: 4,
    imageUrl: "/placeholder-icon.svg",
    category: "café",
    trending: true,
    huntCount: 145,
    address: "27A Foley St, London W1W 6DY",
    priceRange: "$$",
    dietaryOptions: ["vegan", "gluten-free"],
    ambiance: ["quirky", "trendy"]
  },
  {
    id: 2,
    name: "Dishoom",
    description: "Bombay-style café in vintage setting",
    latitude: 51.5155,
    longitude: -0.1428,
    rating: 5,
    imageUrl: "/placeholder-icon.svg",
    category: "restaurant",
    trending: true,
    huntCount: 234,
    address: "12 Upper St Martin's Ln, London WC2H 9FB",
    priceRange: "$$$",
    dietaryOptions: ["vegetarian", "vegan"],
    ambiance: ["vintage", "atmospheric"]
  },
  {
    id: 3,
    name: "Farm Girl",
    description: "Australian-inspired healthy café",
    latitude: 51.5074,
    longitude: -0.2744,
    rating: 4,
    imageUrl: "/placeholder-icon.svg",
    category: "café",
    trending: true,
    huntCount: 167,
    address: "1 Carnaby St, London W1F 9PB",
    priceRange: "$$",
    dietaryOptions: ["vegan", "gluten-free", "healthy"],
    ambiance: ["healthy", "trendy"]
  },
  {
    id: 4,
    name: "1Rebel",
    description: "Boutique fitness with nightclub vibes",
    latitude: 51.5074,
    longitude: -0.2729,
    rating: 4,
    imageUrl: "/placeholder-icon.svg",
    category: "fitness",
    trending: true,
    huntCount: 98,
    address: "63 St Mary Axe, London EC3A 8AA",
    priceRange: "$$$",
    dietaryOptions: [],
    ambiance: ["high-energy", "luxury"]
  },
  {
    id: 5,
    name: "Sketch",
    description: "Pink tearoom with egg-shaped pods",
    latitude: 51.5127,
    longitude: -0.1421,
    rating: 4,
    imageUrl: "/placeholder-icon.svg",
    category: "restaurant",
    trending: true,
    huntCount: 189,
    address: "9 Conduit St, London W1S 2XG",
    priceRange: "$$$$",
    dietaryOptions: ["vegetarian"],
    ambiance: ["luxury", "instagram-worthy"]
  }
];

export default function SimpleMapView() {
  const { latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();
  const { toast } = useToast();
  const [nearbySpots, setNearbySpots] = useState(TRENDY_SPOTS);
  const [checkedInSpots, setCheckedInSpots] = useState<Set<number>>(new Set());

  // Calculate distances and filter nearby spots (within 1.8km)
  useEffect(() => {
    if (latitude && longitude) {
      const spotsWithDistance = TRENDY_SPOTS.map(spot => ({
        ...spot,
        distance: calculateDistance(latitude, longitude, spot.latitude, spot.longitude)
      }))
      .filter(spot => spot.distance <= 1800) // 1.8km limit
      .sort((a, b) => a.distance - b.distance);

      setNearbySpots(spotsWithDistance);
      
      toast({
        title: `Found ${spotsWithDistance.length} trendy spots nearby! ✨`,
        description: "Ready to start hunting?",
      });
    }
  }, [latitude, longitude, toast]);

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
            {nearbySpots.length} spots found nearby
          </p>
          {latitude && longitude && (
            <p className="text-sm text-gray-600">
              Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
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