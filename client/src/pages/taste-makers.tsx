import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/bottom-navigation";
import TopNavigation from "@/components/top-navigation";
import { ArrowLeft, Crown, Star, TrendingUp, MapPin, Instagram, Heart, Eye, Users, Sparkles, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { User, Spot } from "@shared/schema";

interface TasteMakerWithUser {
  id: number;
  userId: string;
  tier: string;
  influenceScore: number;
  totalFollowers: number;
  spotsDiscovered: number;
  trendsStarted: number;
  verificationStatus: string;
  bio: string;
  specialties: string[];
  locationCity: string;
  locationCountry: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User & { profilePictureUrl?: string };
  followersCount?: number;
  isFollowing?: boolean;
  recentEndorsements?: Array<{
    spot: Spot;
    caption: string;
    engagement: number;
    createdAt: string;
  }>;
}

export default function TasteMakers() {
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());

  // Fetch real taste makers data from API
  const { data: tasteMakers = [], isLoading } = useQuery<TasteMakerWithUser[]>({
    queryKey: ["/api/taste-makers", selectedTier],
    retry: false
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
      case 'elite': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'established': return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
      case 'rising': return 'bg-gradient-to-r from-green-400 to-blue-400 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'legendary': return <Crown className="w-4 h-4" />;
      case 'elite': return <Star className="w-4 h-4" />;
      case 'established': return <TrendingUp className="w-4 h-4" />;
      case 'rising': return <Sparkles className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleFollow = (tasteMakerId: number) => {
    setFollowingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tasteMakerId)) {
        newSet.delete(tasteMakerId);
      } else {
        newSet.add(tasteMakerId);
      }
      return newSet;
    });
  };

  const filteredTasteMakers = tasteMakers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      <TopNavigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Link href="/" asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Crown className="w-6 h-6" />
              <span>Taste Makers</span>
            </h1>
            <p className="text-sm opacity-90">
              Follow the most influential spot hunters and discover trending places
            </p>
          </div>
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['all', 'legendary', 'elite', 'established', 'rising'].map((tier) => (
            <Button
              key={tier}
              variant={selectedTier === tier ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedTier(tier)}
              className={`flex-shrink-0 ${selectedTier === tier ? 'bg-white text-purple-600' : 'text-white hover:bg-white/20'}`}
            >
              {getTierIcon(tier)}
              <span className="ml-1 capitalize">{tier === 'all' ? 'All' : tier}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24 space-y-4">
        <Tabs defaultValue="top-makers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="top-makers">Top Makers</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="top-makers" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 mx-auto mb-4 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading taste makers...</p>
              </div>
            ) : filteredTasteMakers.length === 0 ? (
              <div className="text-center py-16">
                <Crown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No taste makers found</h3>
                <p className="text-gray-500 mb-4">Be the first to discover trending spots and become a taste maker!</p>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  Start Exploring
                </Button>
              </div>
            ) : (
              filteredTasteMakers.map((tasteMaker, index) => (
              <Card key={tasteMaker.id} className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${getTierColor(tasteMaker.tier)}`}>
                      {getTierIcon(tasteMaker.tier)}
                      <span>#{index + 1}</span>
                    </div>
                  </div>

                  {/* Profile Header */}
                  <div className="relative bg-gradient-to-br from-pink-100 to-purple-100 p-6 pt-12">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                            <AvatarImage src={tasteMaker.user.profilePictureUrl} alt={tasteMaker.user.username} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white font-bold">
                              {tasteMaker.user.username.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {tasteMaker.verificationStatus === 'featured' && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                              <Crown className="w-3 h-3 text-yellow-800" />
                            </div>
                          )}
                          {tasteMaker.verificationStatus === 'verified' && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 flex items-center space-x-2">
                            <span>{tasteMaker.user.username}</span>
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{tasteMaker.locationCity}, {tasteMaker.locationCountry}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{tasteMaker.totalFollowers?.toLocaleString()} followers</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{tasteMaker.influenceScore?.toLocaleString()} influence</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleFollow(tasteMaker.id)}
                        size="sm"
                        variant={followingIds.has(tasteMaker.id) || tasteMaker.isFollowing ? "outline" : "default"}
                        className={`${
                          followingIds.has(tasteMaker.id) || tasteMaker.isFollowing
                            ? 'border-pink-300 text-pink-600 hover:bg-pink-50'
                            : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                        }`}
                      >
                        {followingIds.has(tasteMaker.id) || tasteMaker.isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                      {tasteMaker.bio}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tasteMaker.specialties?.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-white/60 text-purple-700">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center space-x-4 mt-4">
                      {tasteMaker.instagramHandle && (
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Instagram className="w-3 h-3" />
                          <span>@{tasteMaker.instagramHandle}</span>
                        </div>
                      )}
                      {tasteMaker.tiktokHandle && (
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <span className="font-bold">TT</span>
                          <span>@{tasteMaker.tiktokHandle}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-1 bg-white">
                    <div className="text-center p-3 border-r border-gray-100">
                      <div className="text-lg font-bold text-purple-600">{tasteMaker.spotsDiscovered}</div>
                      <div className="text-xs text-gray-600">Spots Found</div>
                    </div>
                    <div className="text-center p-3 border-r border-gray-100">
                      <div className="text-lg font-bold text-pink-600">{tasteMaker.trendsStarted}</div>
                      <div className="text-xs text-gray-600">Trends Started</div>
                    </div>
                    <div className="text-center p-3">
                      <div className="text-lg font-bold text-indigo-600">{Math.round((tasteMaker.influenceScore || 0) / 1000)}K</div>
                      <div className="text-xs text-gray-600">Influence</div>
                    </div>
                  </div>

                  {/* Recent Endorsement Preview */}
                  {tasteMaker.recentEndorsements && tasteMaker.recentEndorsements.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-t border-gray-100">
                      <div className="text-xs text-gray-600 mb-2">Latest Endorsement:</div>
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{tasteMaker.recentEndorsements[0].spot.name}</div>
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">{tasteMaker.recentEndorsements[0].caption}</div>
                          <div className="flex items-center space-x-3 mt-2">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Heart className="w-3 h-3" />
                              <span>{tasteMaker.recentEndorsements[0].engagement}</span>
                            </div>
                            <div className="text-xs text-gray-500">2h ago</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4 mt-4">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-gray-900 mb-2">Trending Endorsements</h3>
                <p className="text-sm text-gray-600 mb-4">
                  See what taste makers are recommending right now
                </p>
                <p className="text-sm text-gray-400">Available when users create endorsements</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="following" className="space-y-4 mt-4">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-gray-900 mb-2">Your Followed Taste Makers</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Follow taste makers to get personalized spot recommendations
                </p>
                <p className="text-sm text-gray-400">Start following taste makers to see them here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}