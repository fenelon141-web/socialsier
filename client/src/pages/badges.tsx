import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/bottom-navigation";
import { ArrowLeft, Trophy, Lock } from "lucide-react";
import { Link } from "wouter";
import type { Badge as BadgeType, UserBadge } from "@shared/schema";

export default function Badges() {
  const { data: allBadges, isLoading: allBadgesLoading } = useQuery<BadgeType[]>({
    queryKey: ["/api/badges"]
  });

  const { data: userBadges, isLoading: userBadgesLoading } = useQuery<(UserBadge & { badge: BadgeType })[]>({
    queryKey: ["/api/user/1/badges"]
  });

  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badgeId) || []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-600';
      case 'rare': return 'bg-blue-100 text-blue-600';
      case 'epic': return 'bg-purple-100 text-purple-600';
      case 'legendary': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return '';
      case 'rare': return 'shadow-blue-200';
      case 'epic': return 'shadow-purple-200';
      case 'legendary': return 'shadow-yellow-200 glow-effect';
      default: return '';
    }
  };

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
            <h1 className="text-xl font-bold">Badge Collection 🏆</h1>
            <p className="text-xs opacity-90">
              {userBadges?.length || 0} of {allBadges?.length || 0} badges earned ✨
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{userBadges?.length || 0}</div>
            <div className="text-xs text-gray-600">Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {userBadges?.filter(ub => ub.badge.rarity === 'rare' || ub.badge.rarity === 'epic').length || 0}
            </div>
            <div className="text-xs text-gray-600">Rare+</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {Math.round(((userBadges?.length || 0) / (allBadges?.length || 1)) * 100)}%
            </div>
            <div className="text-xs text-gray-600">Complete</div>
          </div>
        </div>
      </div>

      {/* Badge Categories */}
      <div className="p-4 space-y-4 pb-20">
        {/* Recently Earned */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Recently Earned 🎉</h2>
          <div className="grid grid-cols-2 gap-3">
            {userBadgesLoading ? (
              [1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              userBadges?.slice(-4).map(userBadge => (
                <Card key={userBadge.id} className={`border-2 border-green-200 ${getRarityGlow(userBadge.badge.rarity)}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{userBadge.badge.emoji}</div>
                    <h3 className="font-semibold text-sm text-gray-800">{userBadge.badge.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{userBadge.badge.description}</p>
                    <Badge className={getRarityColor(userBadge.badge.rarity)}>
                      {userBadge.badge.rarity}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* All Badges */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">All Badges 📋</h2>
          <div className="grid grid-cols-2 gap-3">
            {allBadgesLoading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              allBadges?.map(badge => {
                const isEarned = earnedBadgeIds.has(badge.id);
                return (
                  <Card 
                    key={badge.id} 
                    className={`${isEarned 
                      ? `border-2 border-green-200 ${getRarityGlow(badge.rarity)}` 
                      : 'border border-gray-200 opacity-60'
                    }`}
                  >
                    <CardContent className="p-4 text-center relative">
                      {!isEarned && (
                        <div className="absolute inset-0 bg-gray-50 bg-opacity-80 rounded-lg flex items-center justify-center">
                          <Lock className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="text-3xl mb-2">{badge.emoji}</div>
                      <h3 className="font-semibold text-sm text-gray-800">{badge.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                      <Badge className={getRarityColor(badge.rarity)}>
                        {badge.rarity}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
