import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/bottom-navigation";
import { ArrowLeft, Settings, Share, Trophy, MapPin, Star } from "lucide-react";
import { Link } from "wouter";
import type { User, UserBadge, Badge } from "@shared/schema";

export default function Profile() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user/1"]
  });

  const { data: userBadges, isLoading: badgesLoading } = useQuery<(UserBadge & { badge: Badge })[]>({
    queryKey: ["/api/user/1/badges"]
  });

  const nextLevelXP = 1000;
  const currentLevelXP = 300;
  const progressPercentage = (currentLevelXP / nextLevelXP) * 100;

  const stats = [
    { label: "Spots Hunted", value: user?.spotsHunted || 0, icon: "🎯" },
    { label: "Total Points", value: user?.totalPoints || 0, icon: "✨" },
    { label: "Badges Earned", value: userBadges?.length || 0, icon: "🏆" },
    { label: "Current Level", value: user?.level || 1, icon: "📈" }
  ];

  const achievements = [
    { title: "Matcha Master", description: "Hunted 50+ matcha spots", date: "This week", icon: "🍵" },
    { title: "Early Bird", description: "First spot of the day 5 times", date: "Last week", icon: "🌅" },
    { title: "Social Butterfly", description: "Shared 25 spots", date: "2 weeks ago", icon: "🦋" }
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
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Settings className="w-4 h-4" />
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
                  <Button variant="outline" className="flex-1 rounded-xl">
                    Edit Profile
                  </Button>
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
              {achievements.map((achievement, index) => (
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Valley Girl Stats */}
        <Card className="card-gradient rounded-2xl shadow-lg border-0">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Valley Vibes 💅</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Favorite Spot Category</span>
                <span className="text-sm font-semibold text-gray-800">Matcha Cafes ☕</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Most Active Time</span>
                <span className="text-sm font-semibold text-gray-800">Morning Vibes 🌅</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hunting Streak</span>
                <span className="text-sm font-semibold text-gray-800">7 days 🔥</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aesthetic Score</span>
                <span className="text-sm font-semibold text-gray-800">10/10 ✨</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
