// Dedicated WebSocket spots handler for iOS reliability
let globalWebSocket: WebSocket | null = null;
let connectionPromise: Promise<WebSocket> | null = null;

export function initializeWebSocket(): Promise<WebSocket> {
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
    
    console.log(`[WebSocketSpots] Connecting to: ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('[WebSocketSpots] Connected successfully');
      globalWebSocket = ws;
      (window as any).webSocket = ws;
      resolve(ws);
    };
    
    ws.onerror = (error) => {
      console.error('[WebSocketSpots] Connection error:', error);
      connectionPromise = null;
      reject(error);
    };
    
    ws.onclose = () => {
      console.log('[WebSocketSpots] Connection closed, reinitializing...');
      globalWebSocket = null;
      connectionPromise = null;
      setTimeout(() => initializeWebSocket(), 3000);
    };
  });
  
  return connectionPromise;
}

export async function fetchSpotsViaWebSocket(
  latitude: number, 
  longitude: number, 
  filters: any = {}
): Promise<any[]> {
  try {
    // Ensure WebSocket is connected
    const ws = await initializeWebSocket();
    
    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString();
      const requestData = {
        type: 'getSpotsNearby',
        requestId,
        latitude,
        longitude,
        radius: 1800, // 1.8km radius as requested
        limit: 25,
        filters
      };
      
      console.log(`[WebSocketSpots] Sending request:`, requestData);
      
      // Set up response listener
      const messageHandler = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'spotsNearbyResponse' && message.requestId === requestId) {
            ws.removeEventListener('message', messageHandler);
            
            if (message.error) {
              reject(new Error(message.error));
            } else {
              console.log(`[WebSocketSpots] Received ${message.spots?.length || 0} spots`);
              resolve(message.spots || []);
            }
          }
        } catch (error) {
          console.error('[WebSocketSpots] Message parsing error:', error);
        }
      };
      
      ws.addEventListener('message', messageHandler);
      
      // Send request
      ws.send(JSON.stringify(requestData));
      
      // Set timeout
      setTimeout(() => {
        ws.removeEventListener('message', messageHandler);
        reject(new Error('WebSocket request timeout'));
      }, 15000);
    });
    
  } catch (error) {
    console.error('[WebSocketSpots] Fetch error:', error);
    throw error;
  }
}