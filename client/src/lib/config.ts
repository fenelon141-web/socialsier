// iOS Configuration for Production Deployment
export const API_BASE_URL = 'https://hot-girl-hunt-fenelon141.replit.app';
export const WS_BASE_URL = 'wss://hot-girl-hunt-fenelon141.replit.app';

// Environment detection
export const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
export const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
export const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;

// iOS-specific configurations
export const iosConfig = {
  // API Configuration
  api: {
    baseUrl: API_BASE_URL,
    timeout: 30000, // 30 seconds for iOS
    retries: 3,
  },
  // WebSocket configuration for iOS
  websocket: {
    url: `${WS_BASE_URL}/ws`,
    reconnectDelay: 3000,
    maxReconnectAttempts: 10,
    pingInterval: 30000, // Keep connection alive
    forceNew: true, // Force new connection for iOS
  },
  // Location settings optimized for iOS
  location: {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000, // 5 minutes
  },
  // iOS-specific features
  ui: {
    preventZoom: true,
    useSafeArea: true,
    enableHaptics: true,
  },
};

// Test production server connectivity
export const testServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/1`, {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};