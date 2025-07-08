import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee, Dumbbell, Camera, MapPin, Search, Zap } from "lucide-react";
import { Link } from "wouter";
import { useHaptics } from "@/hooks/use-haptics";

export function QuickActions() {
  const { triggerHaptic } = useHaptics();

  const handleAction = (action: string) => {
    triggerHaptic('light');
    // Could add analytics tracking here
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-purple-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/map?filter=coffee">
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm bg-white/50"
              onClick={() => handleAction('find_coffee')}
            >
              <Coffee className="w-4 h-4 mr-2" />
              Find Coffee
            </Button>
          </Link>
          <Link href="/map?filter=fitness">
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm bg-white/50"
              onClick={() => handleAction('find_workout')}
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Find Workout
            </Button>
          </Link>
          <Link href="/social">
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm bg-white/50"
              onClick={() => handleAction('share_moment')}
            >
              <Camera className="w-4 h-4 mr-2" />
              Share Moment
            </Button>
          </Link>
          <Link href="/map">
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm bg-white/50"
              onClick={() => handleAction('explore_nearby')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Explore Nearby
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchBar() {
  const { triggerHaptic } = useHaptics();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Search spots, badges, friends..."
        className="w-full pl-10 pr-4 py-3 rounded-full border border-purple-100 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
        onFocus={() => triggerHaptic('light')}
      />
    </div>
  );
}