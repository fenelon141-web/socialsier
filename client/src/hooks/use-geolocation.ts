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
      console.log('[Geolocation] Starting location request...');
      setLocation(prev => ({ ...prev, loading: true, error: null }));
      
      if (isNative) {
        console.log('[Geolocation] Using Capacitor for native app');
        
        // Check current permissions first
        const currentPermissions = await Geolocation.checkPermissions();
        console.log('[Geolocation] Current permissions:', currentPermissions);
        
        // Request permissions if not granted
        if (currentPermissions.location !== 'granted') {
          console.log('[Geolocation] Requesting location permissions...');
          const permissions = await Geolocation.requestPermissions();
          console.log('[Geolocation] Permission result:', permissions);
          
          if (permissions.location !== 'granted') {
            throw new Error('Location permission denied by user');
          }
        }

        console.log('[Geolocation] Getting current position...');
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout for iPhone
          maximumAge: 10000, // Accept cached location up to 10 seconds old
        });
        
        console.log('[Geolocation] Position received:', position.coords);

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        });
        
        console.log('[Geolocation] Location state updated:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      } else {
        console.log('[Geolocation] Using browser geolocation API for web');
        
        // Use browser geolocation API for web
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by this browser');
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = position.coords;
            console.log('[Geolocation] Position received:', coords);
            console.log('[Geolocation] Location state updated:', { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy });
            
            const newLocation = {
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy,
              loading: false,
              error: null,
            };
            
            console.log('[Geolocation] Setting location state:', newLocation);
            setLocation(newLocation);
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
      console.error('[Geolocation] Error getting location:', error);
      const errorMessage = error instanceof Error ? error.message : 'Location error';
      console.log('[Geolocation] Setting error state:', errorMessage);
      
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