// spots-websocket.ts
let globalWebSocket: WebSocket | null = null;
let connectionPromise: Promise<WebSocket> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// ✅ Always production WebSocket endpoint
const FLY_WS_URL = "wss://socialiser-4.fly.dev/ws";

export function initializeWebSocket(): Promise<WebSocket> {
  if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
    return Promise.resolve(globalWebSocket);
  }

  if (connectionPromise) return connectionPromise;

  connectionPromise = new Promise((resolve, reject) => {
    const ws = new WebSocket(FLY_WS_URL);

    // Connection timeout
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.close();
        connectionPromise = null;
        reject(new Error("WebSocket connection timeout"));
      }
    }, 8000);

    ws.onopen = () => {
      clearTimeout(connectionTimeout);
      globalWebSocket = ws;
      reconnectAttempts = 0; // reset after success
      resolve(ws);
    };

    ws.onerror = (error) => {
      clearTimeout(connectionTimeout);
      connectionPromise = null;
      reject(error);
    };

    ws.onclose = () => {
      clearTimeout(connectionTimeout);
      globalWebSocket = null;
      connectionPromise = null;

      // Exponential backoff reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        reconnectAttempts++;
        setTimeout(() => initializeWebSocket(), delay);
      } else {
        reconnectAttempts = 0;
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
    const ws = await initializeWebSocket();

    if (ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not ready");
    }

    return new Promise((resolve, reject) => {
      const requestId =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);

      const requestData = {
        type: "getSpotsNearby",
        requestId,
        latitude,
        longitude,
        radius: 1800,
        limit: 25,
        filters,
      };

      let responseReceived = false;

      const messageHandler = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);

          if (
            message.type === "spotsNearbyResponse" &&
            message.requestId === requestId
          ) {
            responseReceived = true;
            ws.removeEventListener("message", messageHandler);

            if (message.error) {
              reject(new Error(message.error));
            } else {
              resolve(message.spots || []);
            }
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.addEventListener("message", messageHandler);

      try {
        ws.send(JSON.stringify(requestData));
      } catch {
        ws.removeEventListener("message", messageHandler);
        reject(new Error("Failed to send WebSocket message"));
        return;
      }

      setTimeout(() => {
        if (!responseReceived) {
          ws.removeEventListener("message", messageHandler);
          reject(new Error("WebSocket request timeout"));
        }
      }, 12000);
    });
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = 1000 * (retryCount + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchSpotsViaWebSocket(latitude, longitude, filters, retryCount + 1);
    }
    throw error;
  }
}
