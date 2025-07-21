import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellRing, MapPin, Clock, Star, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationCenter() {
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
    
    // If it's a trending spot notification, could navigate to map/spot
    if (notification.type === 'nearby_trending' && notification.data) {
      const { latitude, longitude, spotName } = notification.data;
      const mapUrl = `https://www.google.com/maps/search/${spotName}/@${latitude},${longitude},16z`;
      window.open(mapUrl, '_blank');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'nearby_trending':
        return <MapPin className="w-4 h-4 text-pink-500" />;
      case 'friend_activity':
        return <BellRing className="w-4 h-4 text-blue-500" />;
      case 'challenge_complete':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {/* Trending Spots Section */}
            {trendingNotifications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-pink-500" />
                  Trending Nearby
                </h4>
                <div className="space-y-2">
                  {trendingNotifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                        notification.read 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-pink-50 border-pink-200 hover:bg-pink-100'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </div>
                            {notification.data?.distance && (
                              <div className="text-xs text-pink-600 font-medium">
                                {notification.data.distance}m away
                              </div>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Notifications */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                All Notifications
              </h4>
              <div className="space-y-2">
                {notifications?.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications yet</p>
                    <p className="text-xs text-gray-400">We'll notify you about trending spots nearby</p>
                  </div>
                ) : (
                  notifications?.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                        notification.read 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        {notifications && notifications.length > 10 && (
          <div className="pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full">
              View All Notifications
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}