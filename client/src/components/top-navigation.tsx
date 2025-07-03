import { useQuery } from "@tanstack/react-query";
import { MapPin, Trophy } from "lucide-react";
import type { User } from "@shared/schema";

export default function TopNavigation() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user/1"]
  });

  return (
    <div className="bg-gradient-to-r from-pink-400 to-purple-300 p-4 text-white relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="text-2xl animate-bounce-slow" />
          <div>
            <h1 className="text-xl font-bold">Hot Girl Hunt ✨</h1>
            <p className="text-xs opacity-90">Beverly Hills, CA 📍</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Trophy className="text-yellow-300 text-xl" />
            <span className="absolute -top-2 -right-2 bg-red-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              3
            </span>
          </div>
          <img 
            src={user?.avatar || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"} 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full border-2 border-white glow-effect"
          />
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="flex justify-between mt-3 text-center">
        <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
          <span className="text-xs font-semibold">💎 {user?.spotsHunted || 127} Spots</span>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
          <span className="text-xs font-semibold">🏆 Level {user?.level || 8}</span>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
          <span className="text-xs font-semibold">✨ {(user?.totalPoints || 2300).toLocaleString()} Points</span>
        </div>
      </div>
    </div>
  );
}
