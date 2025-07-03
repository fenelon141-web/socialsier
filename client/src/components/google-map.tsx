import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  spots: any[];
  onSpotClick?: (spot: any) => void;
}

export default function GoogleMap({ center, spots, onSpotClick }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get API key from server
  const { data: config } = useQuery<{ googleMapsApiKey: string }>({
    queryKey: ["/api/config"],
  });

  // Load Google Maps script
  useEffect(() => {
    if (!config?.googleMapsApiKey || isLoaded) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
      initializeMap();
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [config]);

  // Initialize map
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      styles: [
        // Valley Girl aesthetic map styling
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#ffeef9" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }]
        },
        {
          featureType: "water",
          elementType: "geometry", 
          stylers: [{ color: "#e8d5ff" }]
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [{ color: "#fff0f8" }]
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#fdf2f8" }]
        }
      ],
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    setMap(mapInstance);

    // Add user location marker
    new window.google.maps.Marker({
      position: center,
      map: mapInstance,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#fff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    });
  };

  // Update center when location changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [map, center]);

  // Update markers when spots change
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Add new markers
    const newMarkers = spots.map(spot => {
      const marker = new window.google.maps.Marker({
        position: { lat: spot.latitude, lng: spot.longitude },
        map: map,
        title: spot.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#ff69b4" stroke="#fff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">📍</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        if (onSpotClick) onSpotClick(spot);
        
        // Show info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: createInfoWindowContent(spot)
        });
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (spots.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(center); // Include user location
      spots.forEach(spot => {
        bounds.extend({ lat: spot.latitude, lng: spot.longitude });
      });
      map.fitBounds(bounds);
    }
  }, [map, spots, onSpotClick]);

  const createInfoWindowContent = (spot: any) => {
    const rating = spot.rating ? `⭐ ${spot.rating}` : '';
    const distance = spot.distance ? `${Math.round(spot.distance)}m away` : '';
    
    return `
      <div style="max-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <img src="${spot.imageUrl}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px;">${spot.name}</h3>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${spot.description}</p>
        <div style="display: flex; gap: 8px; font-size: 14px;">
          ${rating ? `<span style="color: #ff6b35;">${rating}</span>` : ''}
          ${distance ? `<span style="color: #ff69b4; font-weight: 500;">${distance}</span>` : ''}
        </div>
      </div>
    `;
  };

  if (!config?.googleMapsApiKey) {
    return (
      <div className="h-64 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-600">Map loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-64 rounded-lg"
      style={{ minHeight: '256px' }}
    />
  );
}