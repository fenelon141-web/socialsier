import { useQuery } from "@tanstack/react-query";
import { MapPin, Trophy } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import NotificationCenter from "@/components/notification-center";
import type { User } from "@shared/schema";

export default function TopNavigation() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user/1"]
  });
  
  const { city, country, loading: locationLoading } = useLocation();

  return (
    <div className="bg-gradient-to-br from-pink-400 via-purple-300 to-indigo-400 p-4 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-8 w-20 h-20 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-12 right-12 w-16 h-16 bg-yellow-200 rounded-full blur-lg"></div>
        <div className="absolute bottom-4 left-20 w-12 h-12 bg-pink-200 rounded-full blur-md"></div>
      </div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <MapPin className="text-2xl animate-bounce-slow drop-shadow-lg" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide drop-shadow-md">Socialise ✨</h1>
            <p className="text-xs opacity-90 font-medium">
              {locationLoading ? (
                <span className="animate-pulse">Finding location...</span>
              ) : city && country ? (
                <span className="flex items-center">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                  {city}, {country} 📍
                </span>
              ) : (
                "Location unavailable 📍"
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <NotificationCenter />
          <div className="relative">
            <div className="bg-yellow-400/20 p-2 rounded-full backdrop-blur-sm">
              <Trophy className="text-yellow-300 text-lg drop-shadow-sm" />
            </div>
            {user && user.spotsHunted > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {Math.min(user.spotsHunted, 99)}
              </span>
            )}
          </div>
          <div className="relative">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"} 
              alt="User Avatar" 
              className="w-11 h-11 rounded-full border-3 border-white shadow-xl transition-transform hover:scale-105"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Stats Bar */}
      <div className="flex justify-between mt-4 gap-2">
        <div className="bg-white/25 backdrop-blur-md rounded-2xl px-4 py-2 flex-1 text-center border border-white/20">
          <div className="text-lg font-bold">{user?.spotsHunted || 0}</div>
          <div className="text-xs opacity-90 font-medium">Spots</div>
        </div>
        <div className="bg-white/25 backdrop-blur-md rounded-2xl px-4 py-2 flex-1 text-center border border-white/20">
          <div className="text-lg font-bold">Level {user?.level || 1}</div>
          <div className="text-xs opacity-90 font-medium">Explorer</div>
        </div>
        <div className="bg-white/25 backdrop-blur-md rounded-2xl px-4 py-2 flex-1 text-center border border-white/20">
          <div className="text-lg font-bold">{(user?.totalPoints || 0).toLocaleString()}</div>
          <div className="text-xs opacity-90 font-medium">Points</div>
        </div>
      </div>
    </div>
  );
}
