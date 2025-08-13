// iOS-specific utilities and helpers
import { iosConfig, isIOS, isCapacitor } from './config';

// WebSocket connection test for iOS
export const testWebSocketConnection = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const testWs = new WebSocket(iosConfig.websocket.url);
    const timeout = setTimeout(() => {
      testWs.close();
      resolve(false);
    }, 5000);

    testWs.onopen = () => {
      clearTimeout(timeout);
      testWs.close();
      resolve(true);
    };

    testWs.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
  });
};

// Handle iOS safe area insets
export const getIOSSafeAreaInsets = () => {
  if (!isIOS) return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const computedStyle = getComputedStyle(document.documentElement);
  return {
    top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
    bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
    left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0,
    right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0,
  };
};

// iOS viewport management
export const optimizeForIOS = () => {
  if (!isIOS) return;

  // Prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Handle viewport height changes (iOS keyboard)
  const setViewportHeight = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  };

  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
  });
};

// Network status for iOS
export const getNetworkStatus = () => {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return {
      online: navigator.onLine,
      connection: (navigator as any).connection || null,
    };
  }
  return { online: true, connection: null };
};

// Initialize iOS optimizations
export const initializeIOSOptimizations = () => {
  if (isIOS || isCapacitor) {
    optimizeForIOS();
    
  }
};