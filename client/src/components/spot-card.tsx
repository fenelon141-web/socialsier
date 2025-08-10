import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Target, Star, Route, MapPin, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useHaptics } from "@/hooks/use-haptics";
import { formatDistance, calculateDistance, isWithinRange } from "@/lib/location-utils";
import { getSpotIcon } from "@/lib/spot-icons";
import { CelebrationAnimation } from "./celebration-animation";
import { useState } from "react";
import type { Spot } from "@shared/schema";

interface SpotCardProps {
  spot: Spot;
}



export default function SpotCard({ spot }: SpotCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();
  const { triggerHaptic } = useHaptics();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);

  // Calculate distance to spot
  const distance = latitude && longitude 
    ? calculateDistance(latitude, longitude, spot.latitude, spot.longitude)
    : null;
  
  const withinRange = distance ? isWithinRange(latitude!, longitude!, spot.latitude, spot.longitude, 100) : false;

  const huntMutation = useMutation({
    mutationFn: async () => {
      if (!latitude || !longitude) {
        throw new Error("Location required for check-in");
      }
      return apiRequest("POST", `/api/spots/${spot.id}/hunt`, { 
        userId: 1, 
        userLatitude: latitude,
        userLongitude: longitude,
        spotData: {
          name: spot.name,
          description: spot.description,
          category: spot.category,
          latitude: spot.latitude,
          longitude: spot.longitude,
          address: spot.address,
          rating: spot.rating,
          imageUrl: spot.imageUrl,
          priceRange: spot.priceRange,
          dietaryOptions: spot.dietaryOptions,
          ambiance: spot.ambiance,
          amenities: spot.amenities
        }
      });
    },
    onSuccess: (data: any) => {
      // Trigger success haptic feedback
      triggerHaptic('success');
      
      // Store celebration data and trigger amazing animation
      setCelebrationData({
        pointsEarned: data.pointsEarned || 50,
        newBadges: data.newBadges || [],
        spotName: spot.name,
        totalPoints: data.totalPoints,
        spotsHunted: data.spotsHunted
      });
      setShowCelebration(true);
      
      // Invalidate all relevant caches to update UI
      queryClient.invalidateQueries({ queryKey: ["/api/spots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/1/badges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData?.message === "Too far from location") {
        toast({
          title: "Too far away! 📍",
          description: errorData.details || "You need to be closer to check in",
          variant: "destructive",
        });
      } else if (errorData?.message === "Location data required for check-in") {
        toast({
          title: "Location needed 📱",
          description: "Please allow location access to check in",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Hunt failed 😢",
          description: "Something went wrong. Try again!",
          variant: "destructive",
        });
      }
    },
  });

  const getDistanceDisplay = () => {
    if (distance !== null) {
      return formatDistance(distance);
    }
    if (locationLoading) {
      return "Loading...";
    }
    if (locationError) {
      return "Location unavailable";
    }
    return "Unknown distance";
  };

  const openDirections = () => {
    // Create a comprehensive search query with location details
    const spotName = spot.name;
    const spotAddress = spot.address || '';
    
    // Build search query prioritizing recognizable place names
    let searchQuery = spotName;
    
    // Add address if available
    if (spotAddress && spotAddress.trim() !== '') {
      searchQuery = `${spotName}, ${spotAddress}`;
    } else {
      // If no address, add city context for better search results
      searchQuery = `${spotName}, London`; // Default to London for context
    }

    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Detect mobile for native app integration
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    try {
      if (isMobile) {
        if (isIOS) {
          // iOS - try Apple Maps first, fallback to Google Maps
          const appleMapsUrl = `https://maps.apple.com/?q=${encodedQuery}&dirflg=d`;
          window.location.href = appleMapsUrl;
          
          // Fallback to Google Maps if Apple Maps doesn't work
          setTimeout(() => {
            const googleMapsUrl = `https://maps.google.com/maps?q=${encodedQuery}&navigate=yes`;
            window.open(googleMapsUrl, '_blank');
          }, 2000);
        } else {
          // Android - use Google Maps directly
          const googleMapsUrl = `https://maps.google.com/maps?q=${encodedQuery}&navigate=yes`;
          window.location.href = googleMapsUrl;
        }
      } else {
        // Desktop - open Google Maps in new tab with proper search query
        const googleMapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;
        window.open(googleMapsUrl, '_blank');
      }
      
      toast({
        title: "Opening navigation",
        description: `Getting directions to ${spotName}`,
      });
      
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation error",
        description: "Unable to open directions",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className="spot-card bg-white rounded-xl p-3 shadow-md border border-purple-100"
      style={{
        WebkitTapHighlightColor: 'rgba(236, 72, 153, 0.1)',
        touchAction: 'manipulation'
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          {getSpotIcon(spot)}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <h3 className="font-semibold text-gray-800 text-sm">{spot.name}</h3>
            {spot.trending && <span className="text-xs">🔥</span>}
          </div>
          <p className="text-xs text-gray-600">{spot.description}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              withinRange 
                ? "bg-green-100 text-green-700" 
                : !latitude || !longitude
                ? "bg-gray-100 text-gray-600"
                : "bg-red-100 text-red-700"
            }`}>
              {getDistanceDisplay()}
              {withinRange && " ✓"}
              {distance && distance > 100 && " ⚠️"}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">{spot.rating}</span>
            </div>
            <span className="text-xs text-gray-500">{spot.huntCount} hunts</span>
          </div>
        </div>
        <div className="flex space-x-2">
          {/* Directions Button */}
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg min-h-[44px] min-w-[44px] transition-transform active:scale-95"
            onClick={openDirections}
            disabled={!latitude || !longitude}
            title="Get directions"
            style={{
              WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.3)',
              touchAction: 'manipulation'
            }}
          >
            <Route className="w-4 h-4" />
          </Button>
          
          {/* Hunt Button */}
          <Button 
            className={`${
              withinRange 
                ? "bg-green-500 hover:bg-green-600" 
                : !latitude || !longitude
                ? "bg-gray-400"
                : "bg-red-400 hover:bg-red-500"
            } text-white p-3 rounded-full shadow-lg disabled:opacity-50 min-h-[44px] min-w-[44px] transition-transform active:scale-95`}
            onClick={() => {
              triggerHaptic('medium');
              huntMutation.mutate();
            }}
            disabled={huntMutation.isPending || !withinRange || !latitude || !longitude}
            style={{
              WebkitTapHighlightColor: withinRange ? 'rgba(34, 197, 94, 0.3)' : 'rgba(248, 113, 113, 0.3)',
              touchAction: 'manipulation'
            }}
            title={
              !latitude || !longitude 
                ? "Location needed" 
                : withinRange 
                ? "In range - tap to hunt!" 
                : `Too far away (${distance ? Math.round(distance) : '?'}m)`
            }
          >
            {!latitude || !longitude ? (
              <MapPin className="w-4 h-4" />
            ) : withinRange ? (
              <Target className="w-4 h-4" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Amazing Celebration Animation */}
      {celebrationData && (
        <CelebrationAnimation
          show={showCelebration}
          onComplete={() => {
            setShowCelebration(false);
            setCelebrationData(null);
          }}
          pointsEarned={celebrationData.pointsEarned}
          newBadges={celebrationData.newBadges}
          spotName={celebrationData.spotName}
        />
      )}
    </div>
  );
}
