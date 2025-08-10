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
      // iOS Production WebSocket URL
      const wsUrl = `wss://hot-girl-hunt-fenelon141.replit.app/ws`;
      
      setConnectionStatus('connecting');
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
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

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Auto-reconnect for iOS (network interruptions are common)
        if (event.code !== 1000) { // Don't reconnect if closed intentionally
          console.log('Attempting to reconnect WebSocket...');
          setTimeout(() => connect(), 3000);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('WebSocket message received:', message);
          
          // Handle built-in message types
          if (message.type === 'authenticated') {
            console.log(`Authenticated as user ${message.userId}`);
          } else if (message.type === 'friend_online') {
            toast({
              title: "Friend Online 🟢",
              description: "One of your friends is now online!",
            });
          } else if (message.type === 'friend_nearby') {
            toast({
              title: "Friend Nearby 📍",
              description: message.message || "A friend is nearby!",
            });
          } else if (message.type === 'friend_activity') {
            const activity = message.activity;
            if (activity.type === 'spot_hunt') {
              toast({
                title: "Squad Activity ✨",
                description: `Your friend just hunted a new spot and earned ${activity.points} points!`,
              });
            }
          } else if (message.type === 'squad_activity') {
            const activity = message.activity;
            if (activity.type === 'challenge_complete') {
              toast({
                title: "Squad Challenge 🏆",
                description: "A squad member completed a challenge!",
              });
            }
          }
          
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onDisconnect?.();
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
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
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
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
    sendMessage,
    sendLocationUpdate,
    sendSpotHunt,
    sendSquadChallengeComplete,
    connect,
    disconnect
  };
}