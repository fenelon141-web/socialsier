import { useState } from "react";
import { Bell, MapPin, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    trendingNotifications,
    markAsRead 
  } = usePushNotifications();

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // If it's a trending spot notification, we could navigate to the map
    if (notification.type === 'nearby_trending' && notification.data?.latitude) {
      // TODO: Navigate to map with spot highlighted
      console.log('Navigate to spot:', notification.data);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-b">
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          {trendingNotifications.length > 0 && (
            <p className="text-sm text-gray-600">
              {trendingNotifications.length} trending spots nearby!
            </p>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs">We'll notify you about trending spots nearby!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.slice(0, 10).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  disabled={false}
                  className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                    !notification.read ? 'bg-pink-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {notification.type === 'nearby_trending' ? (
                        <MapPin className="h-4 w-4 text-pink-500" />
                      ) : notification.type === 'friend_activity' ? (
                        <div className="w-4 h-4 bg-purple-500 rounded-full" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        
                        {notification.type === 'nearby_trending' && notification.data && 
                         typeof notification.data === 'object' && 'distance' in notification.data && (
                          <span className="text-xs text-pink-600 font-medium">
                            {(notification.data as any).distance}m away
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 10 && (
          <div className="p-3 border-t text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}