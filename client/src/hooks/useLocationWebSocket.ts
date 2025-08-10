import { useEffect, useRef, useState } from 'react';
import { useGeolocation } from './use-geolocation';
import { useToast } from '@/hooks/use-toast';

interface LocationWebSocketOptions {
  userId: string;
  onNearbySpots?: (spots: any[]) => void;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  enabled?: boolean;
}

export function useLocationWebSocket(options: LocationWebSocketOptions) {
  const { userId, onNearbySpots, onLocationUpdate, enabled = true } = options;
  const { latitude, longitude } = useGeolocation();
  const [isConnected, setIsConnected] = useState(false);
  const [nearbySpots, setNearbySpots] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const locationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // WebSocket connection with iOS-specific handling
  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Detect if running in iOS app
      const isCapacitor = window.Capacitor?.isNativePlatform();
      const wsUrl = isCapacitor 
        ? 'wss://hot-girl-hunt-fenelon141.replit.app/ws'
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
      
      console.log(`[LocationWebSocket] Connecting to: ${wsUrl}`);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[LocationWebSocket] Connected successfully');
        setIsConnected(true);
        
        // Authenticate immediately
        if (userId) {
          wsRef.current?.send(JSON.stringify({
            type: 'authenticate',
            userId: userId
          }));
        }

        // Start location tracking if we have coordinates
        if (latitude && longitude) {
          sendLocationUpdate(latitude, longitude);
          startLocationTracking();
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[LocationWebSocket] Message received:', message);

          switch (message.type) {
            case 'authenticated':
              console.log(`[LocationWebSocket] Authenticated as user ${message.userId}`);
              break;
              
            case 'nearby_spots_update':
              console.log('[LocationWebSocket] Nearby spots updated:', message.spots);
              setNearbySpots(message.spots || []);
              onNearbySpots?.(message.spots || []);
              break;
              
            case 'location_tracked':
              console.log('[LocationWebSocket] Location tracked successfully');
              onLocationUpdate?.(message.location);
              break;
              
            case 'new_spot_nearby':
              toast({
                title: "New spot discovered! 🎯",
                description: `${message.spotName} is now nearby`,
              });
              break;
              
            case 'friend_nearby':
              toast({
                title: "Friend nearby! 👋",
                description: `${message.friendName} is close to you`,
              });
              break;
          }
        } catch (error) {
          console.error('[LocationWebSocket] Error parsing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[LocationWebSocket] Connection error:', error);
        setIsConnected(false);
      };

      wsRef.current.onclose = (event) => {
        console.log('[LocationWebSocket] Connection closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Auto-reconnect for iOS (network switching is common)
        if (event.code !== 1000 && enabled) {
          console.log('[LocationWebSocket] Attempting to reconnect in 3 seconds...');
          setTimeout(() => connect(), 3000);
        }
      };

    } catch (error) {
      console.error('[LocationWebSocket] Failed to create connection:', error);
      setIsConnected(false);
    }
  };

  // Send location update to server
  const sendLocationUpdate = (lat: number, lng: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'location_update',
        userId: userId,
        latitude: lat,
        longitude: lng,
        timestamp: Date.now()
      };
      
      console.log('[LocationWebSocket] Sending location update:', message);
      wsRef.current.send(JSON.stringify(message));
    }
  };

  // Request nearby spots for current location
  const requestNearbySpots = (lat?: number, lng?: number) => {
    const currentLat = lat || latitude;
    const currentLng = lng || longitude;
    
    if (wsRef.current?.readyState === WebSocket.OPEN && currentLat && currentLng) {
      const message = {
        type: 'request_nearby_spots',
        userId: userId,
        latitude: currentLat,
        longitude: currentLng,
        radius: 1500 // 1.5km radius
      };
      
      console.log('[LocationWebSocket] Requesting nearby spots:', message);
      wsRef.current.send(JSON.stringify(message));
    }
  };

  // Start periodic location tracking
  const startLocationTracking = () => {
    if (locationUpdateIntervalRef.current) {
      clearInterval(locationUpdateIntervalRef.current);
    }

    // Send location updates every 30 seconds
    locationUpdateIntervalRef.current = setInterval(() => {
      if (latitude && longitude) {
        sendLocationUpdate(latitude, longitude);
        requestNearbySpots(latitude, longitude);
      }
    }, 30000);
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (locationUpdateIntervalRef.current) {
      clearInterval(locationUpdateIntervalRef.current);
      locationUpdateIntervalRef.current = null;
    }
  };

  // Initialize connection when enabled
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      stopLocationTracking();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [enabled]);

  // Send location updates when coordinates change
  useEffect(() => {
    if (isConnected && latitude && longitude) {
      sendLocationUpdate(latitude, longitude);
      requestNearbySpots(latitude, longitude);
    }
  }, [isConnected, latitude, longitude]);

  return {
    isConnected,
    nearbySpots,
    sendLocationUpdate,
    requestNearbySpots,
    startLocationTracking,
    stopLocationTracking,
    connect,
    disconnect: () => {
      stopLocationTracking();
      wsRef.current?.close(1000, 'Manual disconnect');
    }
  };
}