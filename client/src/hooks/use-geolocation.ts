import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { useCapacitor } from './use-capacitor';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

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
      
      if (isNative) {
        // Use Capacitor for mobile apps
        const permissions = await Geolocation.requestPermissions();
        
        if (permissions.location !== 'granted') {
          throw new Error('Location permission denied');
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        });
      } else {
        // Use browser geolocation API for web
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by this browser');
        }

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
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      }
    } catch (error) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Location error',
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