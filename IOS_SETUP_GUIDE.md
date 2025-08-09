# iOS Setup Guide for Socialiser

## Overview
This guide will help you set up the iOS version of Socialiser using the pre-configured files in this project.

## Prerequisites
- macOS with Xcode installed
- iOS Simulator or physical iOS device
- Node.js installed

## Quick Setup Steps

### 1. Extract and Navigate
```bash
# Extract the downloaded zip file
cd path/to/socialiser

# Install dependencies
npm install
```

### 2. Build for iOS
```bash
# Build the web application
npm run build

# Copy files to iOS
npx cap copy ios

# Sync with iOS project
npx cap sync ios

# Open in Xcode
open ios/App/App.xcworkspace
```

### 3. Run in iOS Simulator
1. In Xcode, select a simulator (iPhone 14 Pro recommended)
2. Click the "Play" button to build and run
3. The app will launch in the iOS Simulator

## Pre-Configured Features

### ✅ Network Configuration
- API calls point to production server: `https://hot-girl-hunt-fenelon141.replit.app`
- WebSocket connects to: `wss://hot-girl-hunt-fenelon141.replit.app/ws`
- CORS headers configured for iOS requests

### ✅ iOS Scaling & Layout
- Proper viewport configuration with `viewport-fit=cover`
- Safe area handling for notches and Dynamic Island
- Prevention of unwanted zooming on input focus
- iOS-specific CSS utilities (`.safe-top`, `.safe-bottom`, etc.)

### ✅ iOS-Specific Optimizations
- Touch scrolling optimization
- Proper height handling with `-webkit-fill-available`
- Prevention of horizontal overflow
- iOS bounce effect prevention

## Key Files Already Updated

### API Configuration
- `client/src/lib/queryClient.ts` - API base URL set to production
- `client/src/lib/config.ts` - iOS-specific configuration

### Network & WebSocket
- `client/src/hooks/useWebSocket.ts` - WebSocket URL configured
- `client/src/pages/home.tsx` - API endpoints updated

### Styling & Layout
- `client/index.html` - iOS viewport meta tags
- `client/src/index.css` - iOS safe area handling and scaling

## Testing Checklist

### ✅ Core Features to Test
1. **Location Services**: App should request location permission
2. **Trendy Spots**: Map should load with nearby spots
3. **WebSocket**: Real-time features should work
4. **Touch Interactions**: Smooth scrolling and touch responses
5. **Layout**: Proper scaling on different iPhone sizes

### ✅ iOS-Specific Tests
1. **Safe Areas**: Content doesn't overlap with notch/Dynamic Island
2. **Rotation**: App handles orientation changes properly
3. **Background**: App behavior when backgrounded and foregrounded
4. **Input Focus**: No unwanted zooming when tapping input fields

## Troubleshooting

### Common Issues

**Issue**: "Cannot connect to server"
- **Solution**: Ensure your device/simulator has internet connection

**Issue**: "Location not working"
- **Solution**: Grant location permissions in iOS Settings

**Issue**: "App looks zoomed in"
- **Solution**: Check that `viewport-fit=cover` is in index.html

**Issue**: "WebSocket not connecting"
- **Solution**: Verify WSS URL in useWebSocket.ts

## Production Deployment

When ready for App Store:
1. Update bundle identifier in Xcode
2. Add App Store icons and splash screens
3. Configure signing certificates
4. Test on physical devices
5. Submit through Xcode

## Server Status
The production server is live at: https://hot-girl-hunt-fenelon141.replit.app

You can verify it's working by visiting the URL in a browser.

## Support
If you encounter issues, check the console logs in Xcode's debug area for detailed error messages.