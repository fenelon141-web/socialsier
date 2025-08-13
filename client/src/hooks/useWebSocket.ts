import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  userId?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { userId, onMessage, onConnect, onDisconnect } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // iOS Production WebSocket URL with fallback detection
      const isCapacitor = (window as any).Capacitor?.isNativePlatform();
      const wsUrl = isCapacitor 
        ? `wss://hot-girl-hunt-fenelon141.replit.app/ws`
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
      
      setConnectionStatus('connecting');
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Authenticate if userId is provided
        if (userId) {
          wsRef.current?.send(JSON.stringify({
            type: 'authenticate',
            userId: userId
          }));
        }
        
        onConnect?.();
      };

      wsRef.current.onerror = () => {
        setConnectionStatus('error');
        setIsConnected(false);
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Auto-reconnect for iOS (network interruptions are common)
        if (event.code !== 1000) { // Don't reconnect if closed intentionally
          setTimeout(() => connect(), 3000);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          
          // Handle built-in message types silently (social features disabled)
          if (message.type === 'authenticated') {
            // Authentication success - no UI needed
          }
          
          onMessage?.(message);
        } catch (error) {
          // Message parsing failed - continue silently
        }
      };

    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  // Auto-connect when userId is provided
  useEffect(() => {
    if (userId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [userId]);

  // Send location updates periodically
  const sendLocationUpdate = (latitude: number, longitude: number) => {
    if (userId) {
      sendMessage({
        type: 'location_update',
        userId,
        latitude,
        longitude
      });
    }
  };

  // Send spot hunt notification
  const sendSpotHunt = (spotId: number, points: number, badge?: any) => {
    if (userId) {
      sendMessage({
        type: 'spot_hunt',
        userId,
        spotId,
        points,
        badge
      });
    }
  };

  // Send squad challenge completion
  const sendSquadChallengeComplete = (challengeId: number, squadId: number) => {
    if (userId) {
      sendMessage({
        type: 'squad_challenge_complete',
        userId,
        challengeId,
        squadId
      });
    }
  };

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    sendLocationUpdate,
    sendSpotHunt,
    sendSquadChallengeComplete
  };
}