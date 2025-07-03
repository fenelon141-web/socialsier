import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
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
      
      // Request permissions first
      const permissions = await Geolocation.requestPermissions();
      
      if (permissions.location !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Get current position
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
  }, []);

  return {
    ...location,
    refetch: getCurrentPosition,
  };
}