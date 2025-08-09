// iOS Configuration for Production Deployment
export const API_BASE_URL = 'https://hot-girl-hunt-fenelon141.replit.app';
export const WS_BASE_URL = 'wss://hot-girl-hunt-fenelon141.replit.app';

// Environment detection
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// iOS-specific configurations
export const iosConfig = {
  // Prevent zoom on input focus
  preventZoom: true,
  // Handle safe areas
  useSafeArea: true,
  // WebSocket reconnection settings
  websocket: {
    reconnectDelay: 3000,
    maxReconnectAttempts: 5,
  },
  // Location settings
  location: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
  },
};