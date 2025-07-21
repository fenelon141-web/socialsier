import { Button } from "@/components/ui/button";
import { Home, Map, Users, Trophy, User, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Hunt", isActive: location === "/" },
    { path: "/map", icon: Map, label: "Map", isActive: location === "/map" },
    { path: "/discover", icon: Sparkles, label: "Discover", isActive: location === "/discover" },
    { path: "/badges", icon: Trophy, label: "Badges", isActive: location === "/badges" },
    { path: "/profile", icon: User, label: "Profile", isActive: location === "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md">
      {/* Glass morphism background with enhanced blur */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-pink-100 px-4 py-3 rounded-t-3xl shadow-2xl">
        <div className="flex justify-around items-center relative">
          {/* Background glow indicator */}
          <div 
            className="absolute h-12 w-16 bg-gradient-to-r from-pink-200 to-purple-200 rounded-2xl opacity-30 transition-all duration-300 ease-out"
            style={{
              transform: `translateX(${navItems.findIndex(item => item.isActive) * 72 - 144}px)`,
            }}
          />
          
          {navItems.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path} asChild>
                <Button 
                  variant="ghost" 
                  className={`flex flex-col items-center space-y-1 p-2 relative z-10 transition-all duration-200 ${
                    item.isActive 
                      ? 'text-pink-500 transform scale-110' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all duration-200 ${
                    item.isActive 
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 shadow-lg' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <Icon className={`w-5 h-5 ${item.isActive ? 'animate-pulse-soft' : ''}`} />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                  
                  {/* Active indicator dot */}
                  {item.isActive && (
                    <div className="absolute -top-1 w-1 h-1 bg-pink-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
