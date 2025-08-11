// iOS-optimized spots endpoint for reliable native app data delivery
import type { Request, Response } from "express";
import { findNearbyTrendySpots } from "./seed";

// iOS-specific spot fetching with enhanced error handling
export async function getIOSSpotsHandler(req: Request, res: Response) {
  try {
    const { lat, lng, radius = 2000, limit = 25 } = req.query;
    
    console.log(`[iOS-Spots] Request from iOS: lat=${lat}, lng=${lng}, radius=${radius}`);
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat, lng',
        received: { lat, lng, radius, limit }
      });
    }
    
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusMeters = parseInt(radius as string);
    const limitNum = parseInt(limit as string);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ 
        error: 'Invalid coordinates',
        latitude, longitude
      });
    }
    
    console.log(`[iOS-Spots] Searching for spots around ${latitude}, ${longitude} within ${radiusMeters}m`);
    
    // Get real-time trendy spots from OpenStreetMap
    const spots = await findNearbyTrendySpots(latitude, longitude, radiusMeters, limitNum);
    
    if (!spots || spots.length === 0) {
      console.log(`[iOS-Spots] No spots found, returning empty array`);
      return res.json([]);
    }
    
    console.log(`[iOS-Spots] Returning ${spots.length} spots to iOS client`);
    console.log(`[iOS-Spots] Closest spots: ${spots.slice(0, 3).map((s: any) => `${s.name}: ${s.distance}m`).join(', ')}`);
    
    // Set iOS-friendly headers
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    return res.json(spots);
    
  } catch (error) {
    console.error('[iOS-Spots] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// Dedicated iOS WebSocket handler for spots
export function handleIOSWebSocketSpots(ws: WebSocket, data: any) {
  console.log('[iOS-WebSocket] Spots request received:', data);
  
  const { latitude, longitude, radius = 2000, limit = 25, requestId } = data;
  
  if (!latitude || !longitude) {
    ws.send(JSON.stringify({
      type: 'spotsError',
      requestId,
      error: 'Missing coordinates'
    }));
    return;
  }
  
  // Fetch spots and send via WebSocket
  findNearbyTrendySpots(latitude, longitude, radius, limit)
    .then((spots: any[]) => {
      console.log(`[iOS-WebSocket] Sending ${spots.length} spots to iOS client`);
      ws.send(JSON.stringify({
        type: 'spotsResponse',
        requestId,
        spots,
        count: spots.length
      }));
    })
    .catch((error: Error) => {
      console.error('[iOS-WebSocket] Error fetching spots:', error);
      ws.send(JSON.stringify({
        type: 'spotsError',
        requestId,
        error: error.message
      }));
    });
}