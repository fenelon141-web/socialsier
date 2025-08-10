# iOS Simulator Location Fix

## The Problem
iOS Simulator doesn't provide real GPS coordinates by default, causing:
- Location requests to fail or timeout
- No spots loading on map
- Geolocation hooks returning null/undefined

## Solution: Set Simulator Location

### Method 1: Xcode Simulator Menu
1. **Open iOS Simulator**
2. **Go to Device Menu** → Features → Location
3. **Choose a location:**
   - **London, England** (matches your server data)
   - **Apple** (Cupertino, CA)
   - **City Bicycle Ride** (moving location)
   - **Custom Location** (enter coordinates)

### Method 2: Custom Location Setup
1. Device → Location → Custom Location
2. Enter coordinates:
   - **Latitude:** 51.5074
   - **Longitude:** -0.1278
   - (This is London, where your test spots are located)

### Method 3: Xcode Debug Menu
1. In Xcode: Debug → Simulate Location
2. Choose from preset locations
3. Select London or add custom coordinates

## Verify Location is Working

### Check Console Logs:
Look for these messages in Xcode console:
```
Location permission granted
Current location: {latitude: 51.507, longitude: -0.127}
Finding nearby spots for location: 51.507, -0.127
Found X spots, closest distances: [...]
```

### App Behavior:
- Permission prompt should appear on first launch
- Map should load with spot markers
- Console should show "Found 20 spots" messages
- Distance calculations should show realistic values (300m, 500m, etc.)

## Common Issues & Fixes

### Issue 1: "Location services disabled"
**Fix:** Enable location in simulator settings
- Settings app → Privacy & Security → Location Services → ON

### Issue 2: Permission denied
**Fix:** Reset location permissions
- Settings → General → Transfer or Reset iPhone → Reset → Reset Location & Privacy

### Issue 3: Still no location
**Fix:** Restart simulator with location enabled
1. Close simulator
2. Set location in Xcode first (Debug → Simulate Location → London)
3. Rebuild and run app

## Testing Real Location Features

### On Physical Device:
1. Connect iPhone via USB
2. Select iPhone as build target (not simulator)
3. Build and run on real device
4. Grant location permission when prompted
5. Test outdoors for accurate GPS

### Simulator Limitations:
- No real GPS hardware
- Location must be manually set
- No movement simulation (unless using preset routes)
- Battery/performance testing not accurate

## Debugging Location Issues

### Add Debug Logging:
Check if these console messages appear:
- "Location permission requested"
- "Location permission granted/denied"
- "Current position: lat, lng"
- "WebSocket sending location update"
- "API call: /api/spots/nearby?lat=X&lng=Y"

### Network Connectivity:
Ensure simulator can reach your server:
- Test API endpoint directly in browser
- Check WiFi connectivity
- Verify server is running and accessible

## Expected Results After Fix

Once location is properly set in simulator:
1. App loads successfully
2. Location permission prompt appears
3. Map displays with nearby spots
4. Console shows "Found 20 spots" messages
5. Spot cards display with distance calculations
6. WebSocket location updates work

Your app's location features are working correctly - the simulator just needs manual location configuration.