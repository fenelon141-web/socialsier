import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Target, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Spot } from "@shared/schema";

interface SpotCardProps {
  spot: Spot;
}

export default function SpotCard({ spot }: SpotCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const huntMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/spots/${spot.id}/hunt`, { userId: 1 });
    },
    onSuccess: () => {
      toast({
        title: "Spot hunted! ✨",
        description: `You earned 50 points hunting ${spot.name}! 🎯`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/spots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: () => {
      toast({
        title: "Hunt failed 😢",
        description: "Something went wrong. Try again!",
        variant: "destructive",
      });
    },
  });

  const getDistanceDisplay = () => {
    const distances = ["0.2 mi", "0.5 mi", "0.8 mi", "1.1 mi", "1.4 mi"];
    return distances[spot.id % distances.length];
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
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
              {getDistanceDisplay()}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">{spot.rating}</span>
            </div>
            <span className="text-xs text-gray-500">{spot.huntCount} hunts</span>
          </div>
        </div>
        <Button 
          className="bg-pink-400 text-white p-2 rounded-full shadow-lg hover:bg-pink-500 disabled:opacity-50"
          onClick={() => huntMutation.mutate()}
          disabled={huntMutation.isPending}
        >
          <Target className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
