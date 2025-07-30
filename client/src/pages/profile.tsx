import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/bottom-navigation";
import EditProfileDialog from "@/components/edit-profile-dialog";
import { ArrowLeft, Settings, Share, Trophy, MapPin, Star, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { User, UserBadge, Badge } from "@shared/schema";

export default function Profile() {
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user/1"]
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You've been logged out successfully",
      });
      setLocation("/login");
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was an error logging you out",
        variant: "destructive",
      });
    }
  });

  const { data: userBadges, isLoading: badgesLoading } = useQuery<(UserBadge & { badge: Badge })[]>({
    queryKey: ["/api/user/1/badges"]
  });

  const { data: userStats, isLoading: statsLoading } = useQuery<{
    spotsHunted: number;
    totalPoints: number;
    currentStreak: number;
    favoriteCategory: string;
    mostActiveTime: string;
    aestheticScore: number;
  }>({
    queryKey: ["/api/user/1/stats"]
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery<{
    title: string;
    description: string;
    date: string;
    icon: string;
  }[]>({
    queryKey: ["/api/user/1/achievements"]
  });

  // Calculate level progress from total points
  const currentLevel = user?.level || 1;
  const baseXP = (currentLevel - 1) * 1000;
  const nextLevelXP = currentLevel * 1000;
  const currentLevelXP = (userStats?.totalPoints || 0) - baseXP;
  const progressPercentage = Math.min(100, (currentLevelXP / 1000) * 100);

  const stats = [
    { label: "Spots Hunted", value: userStats?.spotsHunted || 0, icon: "🎯" },
    { label: "Total Points", value: userStats?.totalPoints || 0, icon: "✨" },
    { label: "Badges Earned", value: userBadges?.length || 0, icon: "🏆" },
    { label: "Current Level", value: user?.level || 1, icon: "📈" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 to-purple-300 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Profile ✨</h1>
              <p className="text-xs opacity-90">Your valley girl journey</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-20">
        {/* Profile Info */}
        <Card className="card-gradient rounded-2xl shadow-lg border-0">
          <CardContent className="p-6 text-center">
            {userLoading ? (
              <div className="animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <img 
                  src={user?.avatar || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"} 
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-pink-200 glow-effect"
                />
                <h2 className="text-xl font-bold text-gray-800">{user?.username || "Valley Girl"}</h2>
                <p className="text-sm text-gray-600">Level {user?.level || 1} Spot Hunter 🎯</p>
                
                {/* Level Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Level {user?.level || 1}</span>
                    <span>Level {(user?.level || 1) + 1}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{currentLevelXP}/{nextLevelXP} XP</p>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button className="flex-1 bg-pink-400 text-white rounded-xl">
                    <Share className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                  {user && (
                    <EditProfileDialog user={user}>
                      <Button variant="outline" className="flex-1 rounded-xl">
                        Edit Profile
                      </Button>
                    </EditProfileDialog>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="border border-purple-100 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-lg font-bold text-gray-800">{stat.value.toLocaleString()}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Badges */}
        <Card className="card-gradient rounded-2xl shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">Recent Badges 🏆</h3>
              <Link href="/badges" asChild>
                <Button variant="ghost" size="sm" className="text-pink-400">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {badgesLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex-shrink-0 bg-white rounded-xl p-3 text-center shadow-md min-w-[80px] animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                ))
              ) : (
                userBadges?.slice(-3).map(userBadge => (
                  <div key={userBadge.id} className="flex-shrink-0 bg-white rounded-xl p-3 text-center shadow-md min-w-[80px]">
                    <div className="text-2xl mb-1">{userBadge.badge.emoji}</div>
                    <p className="text-xs font-semibold text-gray-800">{userBadge.badge.name}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card className="card-gradient rounded-2xl shadow-lg border-0">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Recent Achievements 🌟</h3>
            <div className="space-y-3">
              {achievementsLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-purple-100 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-12 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : achievements && achievements.length > 0 ? (
                achievements.map((achievement, index) => (
                  <div key={index} className="bg-white rounded-xl p-3 shadow-sm border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-800">{achievement.title}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">{achievement.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-100 text-center">
                  <p className="text-sm text-gray-500">Start hunting spots to earn achievements! 🎯</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Valley Girl Stats */}
        <Card className="card-gradient rounded-2xl shadow-lg border-0">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Valley Vibes 💅</h3>
            <div className="space-y-3">
              {statsLoading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between items-center animate-pulse">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Favorite Spot Category</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {userStats?.favoriteCategory || "Cafe"} {userStats?.favoriteCategory === "Cafe" ? "☕" : "🏋️"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Most Active Time</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {userStats?.mostActiveTime || "Morning Vibes"} {
                        userStats?.mostActiveTime === "Morning Vibes" ? "🌅" : 
                        userStats?.mostActiveTime === "Afternoon Energy" ? "☀️" : 
                        userStats?.mostActiveTime === "Evening Glow" ? "🌅" : "🌙"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hunting Streak</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {userStats?.currentStreak || 0} {userStats?.currentStreak === 1 ? "day" : "days"} 🔥
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Aesthetic Score</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {userStats?.aestheticScore || 0}/10 ✨
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
