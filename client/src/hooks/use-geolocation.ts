import { useState, useEffect } from 'react';
import { useCapacitor } from './use-capacitor';

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
      
      // First try to get real GPS location, even for iOS/native
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // For iOS/native apps, try real GPS first, then fallback to London
      const isNativeOrIOS = isIOSNative() || isNative;
      const timeout = isNativeOrIOS ? 5000 : 10000; // Shorter timeout for native apps
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
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