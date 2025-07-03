// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Check if user is within range of a spot
export function isWithinRange(
  userLat: number,
  userLon: number,
  spotLat: number,
  spotLon: number,
  rangeMeters: number = 100
): boolean {
  const distance = calculateDistance(userLat, userLon, spotLat, spotLon);
  return distance <= rangeMeters;
}

// Filter spots by proximity to user location
export function filterSpotsByProximity<T extends { latitude: number; longitude: number }>(
  spots: T[],
  userLat: number,
  userLon: number,
  maxDistanceMeters: number = 1000
): (T & { distance: number })[] {
  return spots
    .map(spot => ({
      ...spot,
      distance: calculateDistance(userLat, userLon, spot.latitude, spot.longitude)
    }))
    .filter(spot => spot.distance <= maxDistanceMeters)
    .sort((a, b) => a.distance - b.distance);
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}