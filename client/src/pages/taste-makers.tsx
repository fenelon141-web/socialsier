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

  // Mock data for taste makers with high influence scores
  const mockTasteMakers: TasteMakerWithUser[] = [
    {
      id: 1,
      userId: "tm1",
      tier: "legendary",
      influenceScore: 95000,
      totalFollowers: 12500,
      spotsDiscovered: 89,
      trendsStarted: 15,
      verificationStatus: "featured",
      bio: "Coffee connoisseur & wellness enthusiast ✨ Finding the most aesthetic spots in London 🌸",
      specialties: ["coffee", "wellness", "aesthetic cafes"],
      locationCity: "London",
      locationCountry: "UK",
      instagramHandle: "emmacoffeevibes",
      tiktokHandle: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 1,
        username: "Emma Rose",
        email: "emma@example.com",
        password: null,
        level: 25,
        totalPoints: 95000,
        profilePictureUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        spotsHunted: 89,
        avatar: null,
        pushToken: null,
        notifyFriendActivity: null,
        notifyNearbySpots: null,
        notifyChallengeReminders: null,
        createdAt: new Date(),
      },
      followersCount: 12500,
      isFollowing: false,
      recentEndorsements: [
        {
          spot: { id: 1, name: "Sketch London", category: "brunch", rating: 4.8 } as Spot,
          caption: "The pink interior is literally a dream! Their matcha lattes are *chef's kiss* 💕",
          engagement: 1248,
          createdAt: new Date().toISOString(),
        }
      ]
    },
    {
      id: 2,
      userId: "tm2",
      tier: "elite",
      influenceScore: 78000,
      totalFollowers: 8900,
      spotsDiscovered: 67,
      trendsStarted: 12,
      verificationStatus: "verified",
      bio: "Fitness girlie finding the hottest workout spots 💪 Pilates & matcha obsessed",
      specialties: ["fitness", "pilates", "healthy eating"],
      locationCity: "London",
      locationCountry: "UK",
      instagramHandle: "sophiefitvibes",
      tiktokHandle: "sophiefit",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 2,
        username: "Sophie Chen",
        email: "sophie@example.com",
        password: null,
        level: 22,
        totalPoints: 78000,
        profilePictureUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        spotsHunted: 67,
        avatar: null,
        pushToken: null,
        notifyFriendActivity: null,
        notifyNearbySpots: null,
        notifyChallengeReminders: null,
        createdAt: new Date(),
      },
      followersCount: 8900,
      isFollowing: true,
    },
    {
      id: 3,
      userId: "tm3",
      tier: "established",
      influenceScore: 52000,
      totalFollowers: 5200,
      spotsDiscovered: 45,
      trendsStarted: 8,
      verificationStatus: "verified",
      bio: "Brunch queen & aesthetic enthusiast 🥐 Always hunting for the perfect avocado toast",
      specialties: ["brunch", "aesthetic cafes", "photography"],
      locationCity: "London",
      locationCountry: "UK",
      instagramHandle: "zoebrunchclub",
      tiktokHandle: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 3,
        username: "Zoe Martinez",
        email: "zoe@example.com",
        password: null,
        level: 18,
        totalPoints: 52000,
        profilePictureUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        spotsHunted: 45,
        avatar: null,
        pushToken: null,
        notifyFriendActivity: null,
        notifyNearbySpots: null,
        notifyChallengeReminders: null,
        createdAt: new Date(),
      },
      followersCount: 5200,
      isFollowing: false,
    }
  ];

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

  const filteredTasteMakers = selectedTier === "all" 
    ? mockTasteMakers 
    : mockTasteMakers.filter(tm => tm.tier === selectedTier);

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
            {filteredTasteMakers.map((tasteMaker, index) => (
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
            ))}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4 mt-4">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-gray-900 mb-2">Trending Endorsements</h3>
                <p className="text-sm text-gray-600 mb-4">
                  See what taste makers are recommending right now
                </p>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Coming Soon
                </Button>
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
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Find Taste Makers
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}