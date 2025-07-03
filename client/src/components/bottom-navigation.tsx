import { Button } from "@/components/ui/button";
import { Home, Map, Users, Trophy, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Hunt", isActive: location === "/" },
    { path: "/map", icon: Map, label: "Map", isActive: location === "/map" },
    { path: "/social", icon: Users, label: "Social", isActive: location === "/social" },
    { path: "/badges", icon: Trophy, label: "Badges", isActive: location === "/badges" },
    { path: "/profile", icon: User, label: "Profile", isActive: location === "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          
          if (item.label === "Camera") {
            return (
              <Button
                key={item.path}
                className="bg-pink-400 text-white p-3 rounded-full shadow-lg glow-effect hover:bg-pink-500"
              >
                <Icon className="w-5 h-5" />
              </Button>
            );
          }

          return (
            <Link key={item.path} href={item.path} asChild>
              <Button 
                variant="ghost" 
                className={`flex flex-col items-center space-y-1 p-2 ${
                  item.isActive ? 'text-pink-400' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
