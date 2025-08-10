import { useState, useEffect, useCallback } from 'react';
import { usePushNotifications } from './usePushNotifications';
import { useToast } from './use-toast';
import { useGeolocation } from './use-geolocation';

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

  const { latitude, longitude } = useGeolocation();

  const startTracking = useCallback(() => {
    if (!latitude || !longitude) {
      toast({
        title: "Location Required",
        description: "Please allow location access to enable tracking",
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, isTracking: true, error: null }));
    
    // Use current position from useGeolocation hook
    checkNearby(latitude, longitude);
    
    toast({
      title: "Tracking Started",
      description: "You'll get alerts when trending spots are nearby",
      duration: 3000,
    });

    return () => {
      setState(prev => ({ ...prev, isTracking: false }));
    };
  }, [checkNearby, toast, latitude, longitude]);

  const stopTracking = useCallback(() => {
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (latitude && longitude) {
      return Promise.resolve({
        latitude,
        longitude,
        accuracy: null
      });
    }
    return Promise.reject(new Error('Location not available'));
  }, [latitude, longitude]);

  // Auto-start tracking when location becomes available
  useEffect(() => {
    const shouldAutoTrack = localStorage.getItem('socialiser-auto-track') === 'true';
    if (shouldAutoTrack && !state.isTracking && latitude && longitude) {
      startTracking();
    }
  }, [startTracking, state.isTracking, latitude, longitude]);

  const enableAutoTracking = useCallback(() => {
    localStorage.setItem('socialiser-auto-track', 'true');
    startTracking();
    
    toast({
      title: "Auto-Tracking Enabled",
      description: "You'll get alerts when trending spots are nearby",
      duration: 3000,
    });
  }, [startTracking, toast]);

  const disableAutoTracking = useCallback(() => {
    localStorage.setItem('socialiser-auto-track', 'false');
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
    isAutoTrackingEnabled: localStorage.getItem('socialiser-auto-track') === 'true',
  };
}