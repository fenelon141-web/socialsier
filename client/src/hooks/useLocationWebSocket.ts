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
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {

      return;
    }

    // Clean up existing connection first
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      // Detect if running in iOS app
      const isCapacitor = (window as any).Capacitor?.isNativePlatform();
      const wsUrl = isCapacitor 
        ? 'wss://hot-girl-hunt-fenelon141.replit.app/ws'
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
      

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {

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


          switch (message.type) {
            case 'authenticated':

              break;
              
            case 'nearby_spots_update':

              setNearbySpots(message.spots || []);
              onNearbySpots?.(message.spots || []);
              break;
              
            case 'location_tracked':

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
          // Message parsing error
        }
      };

      wsRef.current.onerror = (error) => {
        // Connection error
        setIsConnected(false);
      };

      wsRef.current.onclose = (event) => {

        setIsConnected(false);
        
        // Prevent multiple reconnection attempts
        if (event.code !== 1000 && enabled && !wsRef.current) {

          setTimeout(() => {
            if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
              connect();
            }
          }, 5000);
        }
      };

    } catch (error) {
      // Failed to create connection
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