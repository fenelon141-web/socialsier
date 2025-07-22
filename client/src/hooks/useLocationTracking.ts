import { useState, useEffect, useCallback } from 'react';
import { usePushNotifications } from './usePushNotifications';
import { useToast } from './use-toast';

interface LocationTrackingState {
  isTracking: boolean;
  position: GeolocationPosition | null;
  error: GeolocationPositionError | null;
  lastUpdate: Date | null;
}

export function useLocationTracking() {
  const [state, setState] = useState<LocationTrackingState>({
    isTracking: false,
    position: null,
    error: null,
    lastUpdate: null,
  });

  const { checkNearby } = usePushNotifications();
  const { toast } = useToast();

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your device doesn't support location tracking",
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, isTracking: true, error: null }));

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState(prev => ({
          ...prev,
          position,
          error: null,
          lastUpdate: new Date(),
        }));

        // Check for nearby trending spots every location update
        checkNearby(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setState(prev => ({ ...prev, error, isTracking: false }));
        
        if (error.code === error.PERMISSION_DENIED) {
          toast({
            title: "Location Permission Denied",
            description: "Please allow location access to get nearby spot alerts",
            variant: "destructive",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // 30 seconds
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setState(prev => ({ ...prev, isTracking: false }));
    };
  }, [checkNearby, toast]);

  const stopTracking = useCallback(() => {
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      });
    });
  }, []);

  // Auto-start tracking on page load if user has previously enabled notifications
  useEffect(() => {
    const shouldAutoTrack = localStorage.getItem('iykyk-auto-track') === 'true';
    if (shouldAutoTrack && !state.isTracking) {
      const cleanup = startTracking();
      return cleanup;
    }
  }, [startTracking, state.isTracking]);

  const enableAutoTracking = useCallback(() => {
    localStorage.setItem('iykyk-auto-track', 'true');
    const cleanup = startTracking();
    
    toast({
      title: "Auto-Tracking Enabled ✅",
      description: "You'll get alerts when trending spots are nearby",
      duration: 3000,
    });

    return cleanup;
  }, [startTracking, toast]);

  const disableAutoTracking = useCallback(() => {
    localStorage.setItem('iykyk-auto-track', 'false');
    stopTracking();
    
    toast({
      title: "Auto-Tracking Disabled",
      description: "You can still manually check for nearby spots",
      duration: 3000,
    });
  }, [stopTracking, toast]);

  return {
    ...state,
    startTracking,
    stopTracking,
    getCurrentPosition,
    enableAutoTracking,
    disableAutoTracking,
    isAutoTrackingEnabled: localStorage.getItem('iykyk-auto-track') === 'true',
  };
}