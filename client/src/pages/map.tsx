import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import { ArrowLeft, MapPin, Star, Target } from "lucide-react";
import { Link } from "wouter";
import type { Spot } from "@shared/schema";

export default function MapView() {
  const { data: spots, isLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots"]
  });

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

      {/* Mock Map Area */}
      <div className="relative h-64 bg-gradient-to-br from-green-100 to-blue-100 border-b">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-pink-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Interactive map would go here</p>
            <p className="text-xs text-gray-500">Beverly Hills, CA 📍</p>
          </div>
        </div>
        
        {/* Mock spot markers */}
        <div className="absolute top-16 left-12">
          <div className="w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-bounce-slow">
            1
          </div>
        </div>
        <div className="absolute top-32 right-16">
          <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
            2
          </div>
        </div>
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
            3
          </div>
        </div>
      </div>

      {/* Spots List */}
      <div className="p-4 space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Nearby Spots 📍</h2>
          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
            {spots?.length || 0} spots found
          </span>
        </div>

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
          ) : (
            spots?.map((spot, index) => (
              <Card key={spot.id} className="spot-card border border-purple-100 shadow-md">
                <CardContent className="p-4">
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
                          {(0.2 + index * 0.3).toFixed(1)} mi
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{spot.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">{spot.huntCount} hunts</span>
                      </div>
                    </div>
                    <Button className="bg-pink-400 text-white p-2 rounded-full shadow-lg hover:bg-pink-500">
                      <Target className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
