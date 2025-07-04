import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGeolocation } from "./use-geolocation";
import type { Notification } from "@shared/schema";

export function usePushNotifications(userId: string = "1") {
  const [isEnabled, setIsEnabled] = useState(true);
  const { latitude, longitude } = useGeolocation();
  const queryClient = useQueryClient();

  // Get user notifications
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/user", userId, "notifications"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get notification service status
  const { data: serviceStatus } = useQuery({
    queryKey: ["/api/notifications/status"],
    refetchInterval: 60000, // Check status every minute
  });

  // Track location mutation
  const trackLocationMutation = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      return apiRequest(`/api/user/${userId}/track-location`, "POST", {
        latitude: lat,
        longitude: lng
      });
    },
    onSuccess: () => {
      // Refresh notifications after tracking location
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "notifications"] });
    },
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest(`/api/notifications/${notificationId}/read`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "notifications"] });
    },
  });

  // Test nearby notifications (for debugging)
  const testNearbyMutation = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      return apiRequest("/api/notifications/test-nearby", "POST", {
        userId,
        latitude: lat,
        longitude: lng
      });
    },
  });

  // Auto-track location when available and enabled
  useEffect(() => {
    if (isEnabled && latitude && longitude) {
      trackLocationMutation.mutate({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude, isEnabled]);

  // Get unread notifications count
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Get recent trending notifications
  const trendingNotifications = notifications?.filter(n => 
    n.type === "nearby_trending" && !n.read
  ) || [];

  return {
    notifications: notifications || [],
    unreadCount,
    trendingNotifications,
    isLoading,
    isEnabled,
    serviceStatus,
    setIsEnabled,
    markAsRead: (id: number) => markAsReadMutation.mutate(id),
    testNearby: (lat: number, lng: number) => testNearbyMutation.mutate({ lat, lng }),
    isTracking: trackLocationMutation.isPending,
    isMarkingRead: markAsReadMutation.isPending,
  };
}