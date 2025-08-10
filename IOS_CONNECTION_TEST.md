# iPhone Location & Connection Testing Guide

## Problem: Real iPhone Not Getting Location/Spots

When testing on your actual iPhone, location services may fail due to:

### 1. **iPhone Location Settings**
Check: Settings → Privacy & Security → Location Services
- **Location Services:** ON
- **Socialiser:** While Using App (or Ask Next Time)

### 2. **Network Connectivity Issues**
Your iPhone needs to reach: `https://hot-girl-hunt-fenelon141.replit.app`

**Test connectivity:**
1. Open Safari on iPhone
2. Visit: `https://hot-girl-hunt-fenelon141.replit.app/api/spots/gym`
3. Should see JSON data, not error

### 3. **App Permissions**
In iOS Settings → Socialiser:
- **Location:** While Using App
- **Cellular Data:** ON (if not on WiFi)

### 4. **Debug with Console**
Connect iPhone to Mac:
1. iPhone → Settings → Safari → Advanced → Web Inspector: ON
2. Open Socialiser app
3. Mac Safari → Develop → [Your iPhone] → Socialiser
4. Check console for location errors

## Expected Debug Messages

**Working location:**
```
[Geolocation] Starting location request...
[Geolocation] Using Capacitor for native app
[Geolocation] Current permissions: {location: "granted"}
[Geolocation] Getting current position...
[Geolocation] Position received: {latitude: X, longitude: Y}
[Geolocation] Location state updated: {lat: X, lng: Y}
```

**Working API calls:**
```
WebSocket connected
Finding nearby spots for location: X, Y
Found 20 spots, closest distances: [...]
```

## Common iPhone Issues

### Issue 1: "Location permission denied"
**Fix:** Go to iPhone Settings → Privacy → Location Services → Socialiser → While Using App

### Issue 2: No spots loading
**Fix:** Check network connectivity - app must reach Replit server

### Issue 3: App crashes on location request
**Fix:** Restart app, check iPhone is connected to internet

### Issue 4: Old cached location
**Fix:** Force close app, reopen (double-tap home, swipe up on app)

## Network Requirements for iPhone

Your iPhone must be able to:
- **HTTPS:** Connect to `hot-girl-hunt-fenelon141.replit.app:443`
- **WebSocket:** Connect to `wss://hot-girl-hunt-fenelon141.replit.app/ws`
- **GPS:** Access iPhone location services

Test on both WiFi and Cellular to ensure connectivity.

## Verification Steps

1. **Open app on iPhone**
2. **Grant location permission** when prompted
3. **Check Xcode console** for debug messages
4. **Verify spots load** on map/home pages
5. **Test WebSocket** connection in console

If location works but no spots load, it's a network issue.
If location fails, it's a permission or GPS issue.