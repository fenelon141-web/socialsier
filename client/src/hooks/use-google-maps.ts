import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleMapsService, GoogleMapsPlace } from '@/lib/google-maps';

interface GoogleMapsConfig {
  googleMapsApiKey: string;
}

export function useGoogleMaps() {
  const [mapsService, setMapsService] = useState<GoogleMapsService | null>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get API key from server
  const { data: config } = useQuery<GoogleMapsConfig>({
    queryKey: ["/api/config"],
    staleTime: Infinity, // Config rarely changes
  });

  useEffect(() => {
    if (config?.googleMapsApiKey && !mapsService) {
      const service = new GoogleMapsService(config.googleMapsApiKey);
      setMapsService(service);
    }
  }, [config, mapsService]);

  const initializeMap = useCallback(async (
    container: HTMLElement,
    center: { lat: number; lng: number }
  ) => {
    if (!mapsService) {
      setError('Google Maps service not available');
      return null;
    }

    try {
      setError(null);
      const mapInstance = await mapsService.initializeMap(container, center);
      setMap(mapInstance);
      setIsLoaded(true);
      return mapInstance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
      return null;
    }
  }, [mapsService]);

  const findNearbySpots = useCallback(async (
    location: { lat: number; lng: number },
    radius: number = 2000
  ): Promise<GoogleMapsPlace[]> => {
    if (!mapsService) {
      throw new Error('Google Maps service not available');
    }

    try {
      setError(null);
      return await mapsService.findNearbyTrendySpots(location, radius);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to find nearby spots';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [mapsService]);

  const addMarker = useCallback((place: GoogleMapsPlace) => {
    if (!mapsService) return null;
    return mapsService.addMarker(place);
  }, [mapsService]);

  return {
    isLoaded,
    error,
    mapsService,
    map,
    initializeMap,
    findNearbySpots,
    addMarker,
    hasApiKey: !!config?.googleMapsApiKey
  };
}