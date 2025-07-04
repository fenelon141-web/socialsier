import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getSpotIconEmoji } from '@/lib/spot-icons';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="#fff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const spotIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#ff69b4" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="12" r="3" fill="#fff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface LeafletMapProps {
  center: { lat: number; lng: number };
  spots: any[];
  onSpotClick?: (spot: any) => void;
}

function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], 15);
  }, [map, center]);

  return null;
}

export default function LeafletMap({ center, spots, onSpotClick }: LeafletMapProps) {
  const [mapReady, setMapReady] = useState(false);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        className="w-full h-full"
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} />
        
        {/* User location marker */}
        <Marker position={[center.lat, center.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">Your Location</div>
              <div className="text-sm text-gray-600">
                {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Spot markers */}
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={spotIcon}
            eventHandlers={{
              click: () => {
                if (onSpotClick) onSpotClick(spot);
              },
            }}
          >
            <Popup maxWidth={300}>
              <div className="max-w-xs">
                <div className="flex items-center justify-center w-full h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-md mb-2">
                  <span className="text-4xl">{getSpotIconEmoji(spot)}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {spot.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {spot.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  {spot.rating && (
                    <span className="flex items-center text-yellow-600">
                      ⭐ {spot.rating}
                    </span>
                  )}
                  {spot.distance && (
                    <span className="text-pink-600 font-medium">
                      {Math.round(spot.distance)}m away
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500 capitalize">
                  {spot.category} • {spot.huntCount || 0} hunts
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}