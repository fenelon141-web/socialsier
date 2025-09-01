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
    // Disable WebSocket for iOS to prevent promise rejections
    const isIOSNative = (window as any).Capacitor?.isNativePlatform();
    if (isIOSNative) {
      console.log('[iOS] WebSocket disabled for iOS compatibility');
      return;
    }
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
      
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
        
        // Disable auto-reconnect for iOS to prevent endless rejections
        const isIOSNative = (window as any).Capacitor?.isNativePlatform();
        if (event.code !== 1000 && !isIOSNative) { // Don't reconnect if closed intentionally or on iOS
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
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
        return true;
      }
      return false;
    } catch (error) {
      console.log('[iOS] WebSocket send failed:', error);
      return false;
    }
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