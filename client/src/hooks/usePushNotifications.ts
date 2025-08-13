import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest } from '@/lib/queryClient';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export function usePushNotifications() {
  const [isTracking, setIsTracking] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // WebSocket integration for real-time notifications
  const { isConnected } = useWebSocket({
    userId: "1", // Guest user
    onMessage: (message) => {
      if (message.type === 'trending_spot_notification') {
        const notification = message.notification;
        
        // Show immediate toast notification
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000,
        });
        
        // Refresh notifications list
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      }
    }
  });

  // Get notification service status
  const { data: serviceStatus } = useQuery({
    queryKey: ['/api/notifications/status'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Get user notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Test nearby spots mutation
  const testNearbyMutation = useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      return await apiRequest('/api/test-nearby', 'POST', { latitude, longitude });
    },
    onMutate: () => {
      setIsTracking(true);
    },
    onSuccess: (data: any) => {
      
      
      if (data.newNotifications > 0) {
        toast({
          title: "New Trending Spots Found! 🔥",
          description: `${data.newNotifications} trendy spots discovered nearby`,
          duration: 4000,
        });
      } else {
        toast({
          title: "Location Tracked ✅",
          description: "No new trending spots found right now, but we're watching!",
          duration: 3000,
        });
      }
      
      // Refresh notifications
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/status'] });
    },
    onError: (error) => {
      
      toast({
        title: "Error",
        description: "Failed to check nearby trending spots",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTracking(false);
    }
  });

  // Mark notification as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return await apiRequest(`/api/notifications/${notificationId}/read`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Check for nearby trending spots
  const checkNearbyMutation = useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      return await apiRequest('/api/notifications/test-nearby', 'POST', { 
        userId: "1", 
        latitude, 
        longitude 
      });
    },
    onSuccess: (data: any) => {
      if (data.newNotifications > 0) {
        toast({
          title: "Trending Spots Nearby! 🔥",
          description: `Found ${data.newNotifications} trendy spots in your area`,
          duration: 5000,
        });
        
        // Refresh notifications
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      }
    }
  });

  // Get unread notifications count
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Get recent trending notifications
  const trendingNotifications = notifications?.filter(n => 
    n.type === 'nearby_trending' && 
    new Date(n.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
  ) || [];

  const testNearby = (latitude: number, longitude: number) => {
    testNearbyMutation.mutate({ latitude, longitude });
  };

  const checkNearby = (latitude: number, longitude: number) => {
    checkNearbyMutation.mutate({ latitude, longitude });
  };

  const markAsRead = (notificationId: number) => {
    markReadMutation.mutate(notificationId);
  };

  return {
    notifications,
    notificationsLoading,
    unreadCount,
    trendingNotifications,
    serviceStatus,
    isTracking,
    isConnected,
    testNearby,
    checkNearby,
    markAsRead
  };
}