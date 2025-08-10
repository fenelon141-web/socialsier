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
  UpdatesFeed, 
  DoubleTapLike,
  PullToRefreshContainer 
} from "@/components/social-media-patterns";
import { Heart, MessageCircle, Share, Bookmark, Play, Sparkles, TrendingUp, MapPin } from "lucide-react";
import type { Spot } from "@shared/schema";

export default function DiscoverFeed() {
  const [feedType, setFeedType] = useState<"cards" | "vertical" | "grid">("cards");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const { data: spots = [], refetch, isLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots/trending"],
    retry: false
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
          {/* Header with spot info */}
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm">📍 {spot.address?.split(',')[0]}</div>
                <div className="text-xs text-gray-500">Trending spot</div>
              </div>
            </div>
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

            {/* Content */}
            <div className="space-y-2">
              <div className="text-lg font-semibold">{spot.name}</div>
              <div className="text-sm text-gray-600">{spot.description}</div>
              <div className="text-sm text-gray-500 capitalize">Category: {spot.category}</div>
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
                  {/* Recent Updates */}
                  <UpdatesFeed />
                  
                  {/* Main Feed */}
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 mx-auto mb-4 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
                      <p className="text-gray-500">Loading trending spots...</p>
                    </div>
                  ) : spots.length === 0 ? (
                    <div className="text-center py-16">
                      <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No trending spots</h3>
                      <p className="text-gray-500 mb-4">Check back soon for new discoveries</p>
                    </div>
                  ) : (
                    spots.map(renderCard)
                  )}
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
                <ExploreGrid>
                  {spots.length === 0 ? (
                    <div className="col-span-2 text-center py-16">
                      <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Explore coming soon</h3>
                      <p className="text-gray-500">Discover new spots in grid view</p>
                    </div>
                  ) : (
                    spots.map((spot) => (
                      <Card key={spot.id} className="overflow-hidden">
                        <div className="aspect-square relative">
                          <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2">
                          <h3 className="font-semibold text-sm truncate">{spot.name}</h3>
                        </div>
                      </Card>
                    ))
                  )}
                </ExploreGrid>
              </TabsContent>
            </Tabs>
          </div>
        </PullToRefreshContainer>
      )}

      {feedType !== "vertical" && <BottomNavigation />}
    </div>
  );
}