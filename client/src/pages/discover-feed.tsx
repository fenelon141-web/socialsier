import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/bottom-navigation";
import TopNavigation from "@/components/top-navigation";
import { 
  StoriesStrip, 
  VerticalFeed, 
  ExploreGrid, 
  LiveUpdatesFeed, 
  DoubleTapLike,
  PullToRefreshContainer 
} from "@/components/social-media-patterns";
import { Heart, MessageCircle, Share, Bookmark, Play, Sparkles, TrendingUp, MapPin } from "lucide-react";
import type { Spot } from "@shared/schema";

export default function DiscoverFeed() {
  const [feedType, setFeedType] = useState<"cards" | "vertical" | "grid">("cards");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // Mock trending spots data
  const mockSpots: Spot[] = [
    {
      id: 1,
      name: "Sketch London",
      category: "aesthetic cafe",
      description: "Pink paradise with Instagram-worthy interiors and the most divine matcha lattes ✨",
      address: "9 Conduit St, Mayfair, London",
      latitude: 51.5074,
      longitude: -0.1278,
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&h=600&fit=crop",
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "1Rebel Victoria",
      category: "fitness",
      description: "High-energy HIIT classes in a premium studio with killer vibes 💪",
      address: "1 Angel Ln, London",
      latitude: 51.4975,
      longitude: -0.1357,
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
      createdAt: new Date(),
    },
    {
      id: 3,
      name: "The Ivy Chelsea Garden",
      category: "brunch",
      description: "Gorgeous garden setting with the most aesthetic avocado toast and bottomless mimosas 🥂",
      address: "197 King's Rd, Chelsea, London",
      latitude: 51.4874,
      longitude: -0.1687,
      rating: 4.6,
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=600&fit=crop",
      createdAt: new Date(),
    }
  ];

  const { data: spots = mockSpots, refetch } = useQuery<Spot[]>({
    queryKey: ["/api/spots/trending"],
    initialData: mockSpots
  });

  const handleLike = (spotId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spotId)) {
        newSet.delete(spotId);
      } else {
        newSet.add(spotId);
      }
      return newSet;
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderCard = (spot: Spot) => (
    <DoubleTapLike key={spot.id} onLike={() => handleLike(spot.id)}>
      <Card className="overflow-hidden shadow-lg border-0 bg-white mb-4">
        <CardContent className="p-0">
          {/* Header with user info */}
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">ER</span>
              </div>
              <div>
                <div className="font-semibold text-sm">Emma Rose</div>
                <div className="text-xs text-gray-500">2h • 📍 {spot.address?.split(',')[0]}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-600 font-semibold">
              Follow
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src={spot.imageUrl || `https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop`}
              alt={spot.name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              ⭐ {spot.rating}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => handleLike(spot.id)}
                >
                  <Heart className={`w-6 h-6 ${likedPosts.has(spot.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                </Button>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <MessageCircle className="w-6 h-6 text-gray-700" />
                </Button>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <Share className="w-6 h-6 text-gray-700" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <Bookmark className="w-6 h-6 text-gray-700" />
              </Button>
            </div>

            {/* Likes */}
            <div className="text-sm font-semibold mb-2">
              {Math.floor(Math.random() * 1000) + 100 + (likedPosts.has(spot.id) ? 1 : 0)} likes
            </div>

            {/* Caption */}
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-semibold">Emma Rose </span>
                {spot.description}
              </div>
              <div className="text-sm text-gray-500">
                View all {Math.floor(Math.random() * 50) + 10} comments
              </div>
            </div>

            {/* Hashtags */}
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-sm text-purple-600">#aesthetic</span>
              <span className="text-sm text-purple-600">#matcha</span>
              <span className="text-sm text-purple-600">#london</span>
              <span className="text-sm text-purple-600">#hotgirlspot</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </DoubleTapLike>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {feedType !== "vertical" && <TopNavigation />}
      
      {feedType === "vertical" ? (
        <div className="relative h-screen">
          {/* Back button for vertical feed */}
          <div className="absolute top-4 left-4 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFeedType("cards")}
              className="bg-black/50 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/70"
            >
              ←
            </Button>
          </div>
          <VerticalFeed spots={spots} />
        </div>
      ) : (
        <PullToRefreshContainer onRefresh={handleRefresh}>
          <div className="pb-24">
            {/* Stories Section */}
            <div className="bg-white border-b border-gray-100">
              <StoriesStrip />
            </div>

            <Tabs value={feedType} onValueChange={(value) => setFeedType(value as any)} className="w-full">
              {/* Tab Navigation */}
              <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-12">
                  <TabsTrigger value="cards" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600">
                    Feed
                  </TabsTrigger>
                  <TabsTrigger value="vertical" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600">
                    Stories
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600">
                    Explore
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <TabsContent value="cards" className="mt-0">
                <div className="p-4 space-y-4">
                  {/* Live Updates */}
                  <LiveUpdatesFeed />
                  
                  {/* Main Feed */}
                  {spots.map(renderCard)}
                </div>
              </TabsContent>

              <TabsContent value="vertical" className="mt-0">
                {/* This will trigger the full-screen vertical feed */}
                <div className="h-40 flex items-center justify-center">
                  <Button 
                    onClick={() => setFeedType("vertical")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  >
                    Enter Full Screen Stories
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="grid" className="mt-0">
                <ExploreGrid spots={spots} />
              </TabsContent>
            </Tabs>
          </div>
        </PullToRefreshContainer>
      )}

      {feedType !== "vertical" && <BottomNavigation />}
    </div>
  );
}