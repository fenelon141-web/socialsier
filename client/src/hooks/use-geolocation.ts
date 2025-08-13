import { useState, useEffect } from 'react';
import { useCapacitor } from './use-capacitor';

// Import Capacitor Geolocation for native GPS access
declare global {
  interface Window {
    Capacitor?: {
      Geolocation?: {
        getCurrentPosition: (options?: any) => Promise<any>;
      };
      isNativePlatform: () => boolean;
      platform?: string;
    };
  }
}

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

// iOS and native detection helper
const isIOSNative = () => {
  return (window as any).Capacitor?.isNativePlatform() || 
         (window as any).Capacitor?.platform === 'ios' ||
         (window as any).Device?.info?.platform === 'ios' ||
         window.navigator.userAgent.includes('iPhone') ||
         window.navigator.userAgent.includes('iPad');
};

export function useGeolocation() {
  const { isNative } = useCapacitor();
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  const getCurrentPosition = async () => {
    try {
      setLocation(prev => ({ ...prev, loading: true, error: null }));
      
      const isNativeOrIOS = isIOSNative() || isNative;
      
      // Try Capacitor native geolocation first for iOS apps
      if (isNativeOrIOS && (window as any).Capacitor?.Geolocation) {
        try {
          console.log('[iOS] Using Capacitor native geolocation');
          const position = await (window as any).Capacitor.Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
          });
          
          console.log(`[iOS] Capacitor GPS coordinates: ${position.coords.latitude}, ${position.coords.longitude}`);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            loading: false,
            error: null,
          });
          return;
        } catch (capacitorError) {
          console.log('[iOS] Capacitor geolocation failed, trying web API');
        }
      }
      
      // Fallback to web geolocation API
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const timeout = isNativeOrIOS ? 8000 : 10000; // Timeout for native apps
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(`[iOS] GPS coordinates received: ${position.coords.latitude}, ${position.coords.longitude}`);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            loading: false,
            error: null,
          });
        },
        (error) => {
          // For native/iOS apps, fallback to London coordinates if GPS fails
          if (isNativeOrIOS) {
            console.log(`[iOS] GPS failed, using fallback coordinates: 51.511153, -0.273239`);
            setLocation({
              latitude: 51.511153,
              longitude: -0.273239,
              accuracy: 100,
              loading: false,
              error: 'Using default location - enable GPS for real-time spots',
            });
            return;
          }

          let errorMessage = 'Location error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: timeout,
          maximumAge: 30000, // Shorter cache for more real-time updates
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Location error';
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  useEffect(() => {
    getCurrentPosition();
  }, [isNative]);

  return {
    ...location,
    refetch: getCurrentPosition,
  };
}