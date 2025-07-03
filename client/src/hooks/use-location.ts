import { useState, useEffect } from 'react';
import { useGeolocation } from './use-geolocation';

interface LocationInfo {
  city: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeolocation();
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    city: null,
    country: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (latitude && longitude && !geoLoading) {
      reverseGeocode(latitude, longitude);
    } else if (geoError) {
      setLocationInfo(prev => ({ ...prev, loading: false, error: geoError }));
    }
  }, [latitude, longitude, geoLoading, geoError]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Use OpenStreetMap Nominatim API for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const city = address.city || address.town || address.village || address.municipality;
        const country = address.country;
        
        setLocationInfo({
          city,
          country,
          loading: false,
          error: null
        });
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      setLocationInfo({
        city: null,
        country: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return {
    ...locationInfo,
    loading: geoLoading || locationInfo.loading,
    error: geoError || locationInfo.error
  };
}