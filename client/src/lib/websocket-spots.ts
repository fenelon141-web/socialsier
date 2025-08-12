// Dedicated WebSocket spots handler for iOS reliability
let globalWebSocket: WebSocket | null = null;
let connectionPromise: Promise<WebSocket> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function initializeWebSocket(): Promise<WebSocket> {
  if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
    return Promise.resolve(globalWebSocket);
  }
  
  if (connectionPromise) return connectionPromise;
  
  connectionPromise = new Promise((resolve, reject) => {
    // Force production server for iOS to avoid "Load failed" errors
    const isNative = (window as any).Capacitor?.isNativePlatform();
    const fallbackUrl = 'wss://hot-girl-hunt-fenelon141.replit.app/ws';
    
    const wsUrl = isNative 
      ? fallbackUrl  // Always use production server on native iOS
      : window.location.hostname.includes('replit') 
        ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`
        : fallbackUrl;
    
    console.log(`[WebSocketSpots] Connecting to: ${wsUrl} (attempt ${reconnectAttempts + 1})`);
    
    const ws = new WebSocket(wsUrl);
    
    // Set a connection timeout
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.close();
        connectionPromise = null;
        reject(new Error('WebSocket connection timeout'));
      }
    }, 8000);
    
    ws.onopen = () => {
      clearTimeout(connectionTimeout);
      console.log('[WebSocketSpots] Connected successfully');
      globalWebSocket = ws;
      // Don't override the global window.webSocket to avoid conflicts
      reconnectAttempts = 0; // Reset on successful connection
      resolve(ws);
    };
    
    ws.onerror = (error) => {
      clearTimeout(connectionTimeout);
      console.error('[WebSocketSpots] Connection error:', error);
      connectionPromise = null;
      reject(error);
    };
    
    ws.onclose = () => {
      clearTimeout(connectionTimeout);
      console.log('[WebSocketSpots] Connection closed');
      globalWebSocket = null;
      connectionPromise = null;
      
      // Exponential backoff reconnection
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        reconnectAttempts++;
        console.log(`[WebSocketSpots] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
        setTimeout(() => initializeWebSocket(), delay);
      } else {
        console.warn('[WebSocketSpots] Max reconnection attempts reached');
        reconnectAttempts = 0; // Reset for future attempts
      }
    };
  });
  
  return connectionPromise;
}

export async function fetchSpotsViaWebSocket(
  latitude: number, 
  longitude: number, 
  filters: any = {},
  retryCount = 0
): Promise<any[]> {
  const MAX_RETRIES = 3;
  
  try {
    // Ensure WebSocket is connected with retry logic
    const ws = await initializeWebSocket();
    
    // Check if WebSocket is actually ready
    if (ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not ready');
    }
    
    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const requestData = {
        type: 'getSpotsNearby',
        requestId,
        latitude,
        longitude,
        radius: 1800, // 1.8km radius as requested
        limit: 25,
        filters
      };
      
      console.log(`[WebSocketSpots] Sending request (attempt ${retryCount + 1}):`, requestData);
      
      let responseReceived = false;
      
      // Set up response listener
      const messageHandler = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`[WebSocketSpots] Received message type: ${message.type}, requestId: ${message.requestId}, expected: ${requestId}`);
          
          if (message.type === 'spotsNearbyResponse' && message.requestId === requestId) {
            responseReceived = true;
            ws.removeEventListener('message', messageHandler);
            
            if (message.error) {
              console.error(`[WebSocketSpots] Error response: ${message.error}`);
              reject(new Error(message.error));
            } else {
              console.log(`[WebSocketSpots] Success! Received ${message.spots?.length || 0} spots`);
              console.log(`[WebSocketSpots] Sample spot:`, message.spots?.[0]);
              resolve(message.spots || []);
            }
          } else {
            console.log(`[WebSocketSpots] Ignoring message type: ${message.type}`);
          }
        } catch (error) {
          console.error('[WebSocketSpots] Message parsing error:', error);
          console.log('[WebSocketSpots] Raw message data:', event.data);
        }
      };
      
      ws.addEventListener('message', messageHandler);
      
      // Send request with error handling
      try {
        ws.send(JSON.stringify(requestData));
      } catch (sendError) {
        ws.removeEventListener('message', messageHandler);
        reject(new Error('Failed to send WebSocket message'));
        return;
      }
      
      // Set timeout with retry logic
      setTimeout(() => {
        if (!responseReceived) {
          ws.removeEventListener('message', messageHandler);
          reject(new Error('WebSocket request timeout'));
        }
      }, 12000); // Reduced timeout for faster fallback
    });
    
  } catch (error) {
    console.error(`[WebSocketSpots] Attempt ${retryCount + 1} failed:`, error);
    
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      const delay = 1000 * (retryCount + 1); // Progressive delay
      console.log(`[WebSocketSpots] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchSpotsViaWebSocket(latitude, longitude, filters, retryCount + 1);
    }
    
    throw error;
  }
}