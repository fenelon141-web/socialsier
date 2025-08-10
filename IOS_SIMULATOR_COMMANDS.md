# iOS Simulator Debugging Commands

## Why Simulator Shows "No Spots Found"

The iOS Simulator and your real iPhone work differently:

### Real iPhone (Working):
- **Location:** 51.511, -0.273 (Acton, UK)
- **Server Response:** 20 spots found (Chai Spot, Morrisons Cafe, etc.)
- **Result:** Spots displayed correctly

### iOS Simulator (Different):
- **Location:** Often defaults to Apple Park, California or fake coordinates
- **Server Response:** No spots found for that location
- **Result:** "No spots found nearby"

## Debug the Simulator Location:

### 1. Check Console Logs
Look for these logs in Xcode console when running simulator:
```
[MapView] Location state: {latitude: X, longitude: Y}
[MapView] Fetching spots for location: X, Y
[MapView] API returned N spots
```

### 2. Set Custom Location in Simulator
In iOS Simulator:
1. **Device Menu** → **Location** → **Custom Location**
2. Enter your coordinates:
   - **Latitude:** 51.511
   - **Longitude:** -0.273
3. This will simulate your Acton location

### 3. Alternative: Use London Coordinates
Try these popular London locations:
- **Shoreditch:** 51.525, -0.078
- **Covent Garden:** 51.512, -0.123
- **Camden:** 51.539, -0.143

## Expected Simulator Behavior After Location Fix:
```
[MapView] Location state: {latitude: 51.511, longitude: -0.273}
[MapView] API returned 20 spots
[MapView] Processing 20 spots for display
[MapView] Processed spots ready for render: 20
```

## Key Insight:
Your real iPhone app works perfectly. The simulator just needs the correct location coordinates to find spots in the UK rather than defaulting to California coordinates.

## Test on Real Device vs Simulator:
- **Real iPhone:** Production ready ✅
- **Simulator:** Geographic testing only
- **App Store Submission:** Based on real device testing ✅