import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, BookmarkPlus, Play, ChevronRight, Sparkles, Fire } from "lucide-react";

// Instagram-style Stories Component
export function StoriesStrip() {
  const stories = [
    { id: 1, user: "Emma Rose", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face", hasStory: true, isLive: false },
    { id: 2, user: "Sophie Chen", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face", hasStory: true, isLive: true },
    { id: 3, user: "Zoe Martinez", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face", hasStory: true, isLive: false },
    { id: 4, user: "Add Story", avatar: null, hasStory: false, isLive: false }
  ];

  return (
    <div className="flex space-x-3 p-4 overflow-x-auto scrollbar-hide">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-0">
          <div className={`relative ${story.hasStory ? 'ring-2 ring-gradient-to-tr from-pink-500 to-purple-500 ring-offset-2' : ''} rounded-full`}>
            {story.avatar ? (
              <Avatar className="w-16 h-16">
                <AvatarImage src={story.avatar} alt={story.user} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                  {story.user.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
                <span className="text-2xl">+</span>
              </div>
            )}
            {story.isLive && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                LIVE
              </div>
            )}
          </div>
          <span className="text-xs text-gray-600 max-w-[60px] truncate">{story.user}</span>
        </div>
      ))}
    </div>
  );
}

// TikTok-style Vertical Swipe Feed
export function VerticalFeed({ spots }: { spots: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const currentSpot = spots[currentIndex] || {};

  const handleSwipeUp = () => {
    if (currentIndex < spots.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsLiked(false);
      setIsSaved(false);
    }
  };

  const handleSwipeDown = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsLiked(false);
      setIsSaved(false);
    }
  };

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Main Content Area */}
      <div className="relative h-full">
        {/* Background Image/Video */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentSpot.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=600&fit=crop'})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">{currentSpot.name || "Trending Spot"}</h3>
            <p className="text-sm opacity-90 mb-2">{currentSpot.description || "Amazing spot recommended by taste makers"}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span>📍 {currentSpot.address || "London, UK"}</span>
              <span>⭐ {currentSpot.rating || "4.8"}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 flex items-center space-x-1"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{(currentSpot.likes || 1234) + (isLiked ? 1 : 0)}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 flex items-center space-x-1">
                <MessageCircle className="w-5 h-5" />
                <span>{currentSpot.comments || 89}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Share className="w-5 h-5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setIsSaved(!isSaved)}
            >
              <BookmarkPlus className={`w-5 h-5 ${isSaved ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Side Action Buttons (TikTok style) */}
        <div className="absolute right-4 bottom-32 flex flex-col space-y-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Avatar className="w-12 h-12 ring-2 ring-white">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face" />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30"
            onClick={() => setIsSaved(!isSaved)}
          >
            <BookmarkPlus className={`w-6 h-6 ${isSaved ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
        </div>

        {/* Swipe Indicators */}
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex flex-col space-y-2">
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/20 backdrop-blur-sm text-white rounded-full p-2"
              onClick={handleSwipeDown}
            >
              ↑
            </Button>
          )}
          {currentIndex < spots.length - 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/20 backdrop-blur-sm text-white rounded-full p-2"
              onClick={handleSwipeUp}
            >
              ↓
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Instagram-style Explore Grid
export function ExploreGrid({ spots }: { spots: any[] }) {
  return (
    <div className="grid grid-cols-3 gap-1 p-4">
      {spots.map((spot, index) => (
        <div key={spot.id || index} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
          <img
            src={spot.imageUrl || `https://images.unsplash.com/photo-${1554118811 + index}?w=150&h=150&fit=crop`}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay with engagement stats */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex items-center space-x-4 text-white text-sm font-medium">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 fill-white" />
                <span>{spot.likes || Math.floor(Math.random() * 1000) + 100}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{spot.comments || Math.floor(Math.random() * 100) + 10}</span>
              </div>
            </div>
          </div>

          {/* Trending indicator */}
          {index < 3 && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <Fire className="w-3 h-3" />
              <span>HOT</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Twitter-style Real-time Updates
export function LiveUpdatesFeed() {
  const [updates, setUpdates] = useState([
    { id: 1, text: "Emma just discovered a new matcha spot in Shoreditch!", time: "2m", type: "discovery" },
    { id: 2, text: "15 people checked into Sketch London in the last hour", time: "5m", type: "trending" },
    { id: 3, text: "Sophie started a live workout class review", time: "8m", type: "live" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newUpdate = {
        id: Date.now(),
        text: `${Math.floor(Math.random() * 50) + 1} people are currently at trending spots near you`,
        time: "now",
        type: "trending"
      };
      setUpdates(prev => [newUpdate, ...prev.slice(0, 4)]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Live Updates</span>
        </h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      {updates.map((update) => (
        <div key={update.id} className="flex items-start space-x-3 py-2 border-b border-gray-50 last:border-0">
          <div className={`w-2 h-2 rounded-full mt-2 ${
            update.type === 'discovery' ? 'bg-purple-500' :
            update.type === 'trending' ? 'bg-pink-500' : 'bg-red-500'
          }`} />
          <div className="flex-1">
            <p className="text-sm text-gray-700">{update.text}</p>
            <span className="text-xs text-gray-500">{update.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ClassPass-style Booking Interface
export function BookingInterface({ spot }: { spot: any }) {
  const [selectedTime, setSelectedTime] = useState<string>("");
  const timeSlots = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM"];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">{spot?.name || "Book Your Visit"}</h3>
            <p className="text-sm text-gray-600">{spot?.category || "Premium Experience"}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">Free</div>
            <div className="text-xs text-gray-500">with hunt</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Time</label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className={selectedTime === time ? "bg-purple-600" : ""}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">5 spots available today</span>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            disabled={!selectedTime}
          >
            Reserve Spot {selectedTime && `• ${selectedTime}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Instagram-style Double-tap Like Animation
export function DoubleTapLike({ children, onLike }: { children: React.ReactNode; onLike: () => void }) {
  const [showAnimation, setShowAnimation] = useState(false);

  const handleDoubleClick = () => {
    setShowAnimation(true);
    onLike();
    setTimeout(() => setShowAnimation(false), 1000);
  };

  return (
    <div className="relative" onDoubleClick={handleDoubleClick}>
      {children}
      {showAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Heart className="w-20 h-20 text-red-500 fill-red-500 animate-ping" />
        </div>
      )}
    </div>
  );
}

// Twitter-style Pull-to-refresh
export function PullToRefreshContainer({ onRefresh, children }: { onRefresh: () => void; children: React.ReactNode }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setPullDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop === 0) {
      const distance = Math.max(0, Math.min(100, touch.clientY - 50));
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 70) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 2000);
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-gradient-to-b from-purple-100 to-transparent">
          <div className={`transition-transform ${isRefreshing ? 'animate-spin' : ''}`}>
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
          <span className="ml-2 text-sm text-purple-600">
            {isRefreshing ? 'Refreshing...' : pullDistance > 70 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}
      
      <div style={{ transform: `translateY(${Math.min(pullDistance, 50)}px)` }}>
        {children}
      </div>
    </div>
  );
}