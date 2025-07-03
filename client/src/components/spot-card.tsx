import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Target, Star, Navigation, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useGeolocation } from "@/hooks/use-geolocation";
import { formatDistance, calculateDistance, isWithinRange } from "@/lib/location-utils";
import type { Spot } from "@shared/schema";

interface SpotCardProps {
  spot: Spot;
}

export default function SpotCard({ spot }: SpotCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();

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
        userLongitude: longitude
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Spot hunted! ✨",
        description: `You earned 50 points! Distance: ${data.distance}m`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/spots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
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

  return (
    <div className="spot-card bg-white rounded-xl p-3 shadow-md border border-purple-100">
      <div className="flex items-center space-x-3">
        <img 
          src={spot.imageUrl} 
          alt={spot.name}
          className="w-16 h-16 rounded-xl object-cover"
        />
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
        <Button 
          className={`${
            withinRange 
              ? "bg-green-500 hover:bg-green-600" 
              : !latitude || !longitude
              ? "bg-gray-400"
              : "bg-red-400 hover:bg-red-500"
          } text-white p-2 rounded-full shadow-lg disabled:opacity-50`}
          onClick={() => huntMutation.mutate()}
          disabled={huntMutation.isPending || !withinRange || !latitude || !longitude}
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
  );
}
