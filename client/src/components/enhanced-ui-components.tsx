import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, Bookmark, User, MapPin, Star, TrendingUp, Clock, Users, Eye } from "lucide-react";

// Instagram-style Floating Action Button
export function FloatingActionButton({ onClick, children, className = "" }: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Button
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`
        fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-2xl
        bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700
        text-white border-0 transition-all duration-200 ease-out z-50
        ${isPressed ? 'scale-95 shadow-lg' : 'scale-100 shadow-2xl hover:scale-105'}
        ${className}
      `}
    >
      {children}
    </Button>
  );
}

// TikTok-style Engagement Stats
export function EngagementStats({ likes, comments, shares, saves }: {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}) {
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="flex items-center space-x-6 text-sm text-gray-600">
      <div className="flex items-center space-x-1">
        <Heart className="w-4 h-4" />
        <span className="font-medium">{formatCount(likes)}</span>
      </div>
      <div className="flex items-center space-x-1">
        <MessageCircle className="w-4 h-4" />
        <span className="font-medium">{formatCount(comments)}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Share className="w-4 h-4" />
        <span className="font-medium">{formatCount(shares)}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Bookmark className="w-4 h-4" />
        <span className="font-medium">{formatCount(saves)}</span>
      </div>
    </div>
  );
}

// Instagram-style User Badge
export function UserBadge({ user, isVerified = false, tier, followerCount }: {
  user: { username: string; avatar?: string };
  isVerified?: boolean;
  tier?: "rising" | "established" | "elite" | "legendary";
  followerCount?: number;
}) {
  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "legendary": return "from-yellow-400 to-orange-500";
      case "elite": return "from-purple-500 to-pink-500";
      case "established": return "from-blue-500 to-indigo-500";
      case "rising": return "from-green-400 to-teal-500";
      default: return "from-gray-400 to-gray-500";
    }
  };

  const getTierIcon = (tier?: string) => {
    switch (tier) {
      case "legendary": return "👑";
      case "elite": return "💎";
      case "established": return "⭐";
      case "rising": return "🌟";
      default: return "";
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {tier && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow-lg">
            {getTierIcon(tier)}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900">{user.username}</span>
          {isVerified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
          {tier && (
            <Badge className={`text-xs bg-gradient-to-r ${getTierColor(tier)} text-white border-0`}>
              {tier}
            </Badge>
          )}
        </div>
        {followerCount && (
          <p className="text-xs text-gray-500">{followerCount.toLocaleString()} followers</p>
        )}
      </div>
    </div>
  );
}

// ClassPass-style Time Slot Picker
export function TimeSlotPicker({ onSelect, selectedTime }: {
  onSelect: (time: string) => void;
  selectedTime?: string;
}) {
  const timeSlots = [
    "9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", 
    "3:00 PM", "4:30 PM", "6:00 PM", "7:30 PM"
  ];

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Available Times</h4>
      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(time)}
            className={`${
              selectedTime === time 
                ? "bg-purple-600 hover:bg-purple-700" 
                : "hover:bg-purple-50 hover:border-purple-300"
            }`}
          >
            {time}
          </Button>
        ))}
      </div>
    </div>
  );
}

// Twitter-style Trending Topics
export function TrendingTopics({ topics }: { topics: Array<{ name: string; count: number }> }) {
  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span>Trending Now</span>
        </h3>
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <div key={topic.name} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">#{topic.name}</div>
                <div className="text-sm text-gray-500">{topic.count.toLocaleString()} posts</div>
              </div>
              <div className="text-xs text-purple-600 font-medium">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Instagram-style Story Ring
export function StoryRing({ hasStory, isViewed, children }: {
  hasStory: boolean;
  isViewed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative ${hasStory ? 'p-0.5 rounded-full' : ''}`}>
      {hasStory && (
        <div className={`absolute inset-0 rounded-full ${
          isViewed 
            ? 'bg-gray-300' 
            : 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500'
        }`} />
      )}
      <div className={`relative ${hasStory ? 'bg-white p-0.5 rounded-full' : ''}`}>
        {children}
      </div>
    </div>
  );
}

// TikTok-style Live Indicator
export function LiveIndicator({ viewerCount }: { viewerCount: number }) {
  return (
    <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      <span>LIVE</span>
      <div className="flex items-center space-x-1">
        <Eye className="w-3 h-3" />
        <span>{viewerCount.toLocaleString()}</span>
      </div>
    </div>
  );
}

// Instagram-style Activity Status
export function ActivityStatus({ lastSeen, isOnline }: {
  lastSeen?: Date;
  isOnline?: boolean;
}) {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span>
        {isOnline ? "Active now" : lastSeen ? `Active ${getTimeAgo(lastSeen)}` : "Offline"}
      </span>
    </div>
  );
}

// Swipe Gesture Handler
export function SwipeGesture({ 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown, 
  children 
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  children: React.ReactNode;
}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  };

  const onTouchEndHandler = () => {
    if (!touchStart.current || !touchEnd.current) return;
    
    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
      if (isRightSwipe && onSwipeRight) onSwipeRight();
    } else {
      // Vertical swipe
      if (isUpSwipe && onSwipeUp) onSwipeUp();
      if (isDownSwipe && onSwipeDown) onSwipeDown();
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
    >
      {children}
    </div>
  );
}