# Socialiser - Mobile App Deployment Guide

## Overview
Socialiser has been converted into a mobile app using Capacitor, making it ready for deployment to both the Apple App Store and Google Play Store.

## What's Been Setup

### Mobile App Features
- ✅ Native iOS and Android projects created
- ✅ Location services integration with geolocation
- ✅ Native status bar and splash screen configuration
- ✅ Valley Girl themed app icon and branding
- ✅ PWA manifest for web app installation
- ✅ Mobile-optimized UI and navigation

### App Store Requirements Met
- ✅ Unique app ID: `com.socialiser.app`
- ✅ App name: "Socialiser"
- ✅ Valley Girl themed branding (#ff69b4 pink gradient)
- ✅ Location permission handling
- ✅ Mobile-responsive design

## Next Steps for App Store Deployment

### 1. Apple App Store (iOS)
**Requirements:**
- Apple Developer Account ($99/year)
- Mac computer with Xcode
- iOS device for testing

**Steps:**
```bash
# Open iOS project in Xcode
npx cap open ios

# In Xcode:
# 1. Set your team and bundle identifier
# 2. Add app icons and launch screens
# 3. Configure location permissions in Info.plist
# 4. Build and test on device
# 5. Archive and upload to App Store Connect
```

### 2. Google Play Store (Android)
**Requirements:**
- Google Play Developer Account ($25 one-time)
- Android Studio
- Android device for testing

**Steps:**
```bash
# Open Android project in Android Studio
npx cap open android

# In Android Studio:
# 1. Update app signing configuration
# 2. Add app icons and splash screens
# 3. Configure location permissions in AndroidManifest.xml
# 4. Build signed APK/AAB
# 5. Upload to Google Play Console
```

### 3. Required App Store Assets

**App Icons Needed:**
- iOS: 1024x1024px (App Store), 180x180px (iPhone), 167x167px (iPad)
- Android: 512x512px (Play Store), various sizes for different densities

**Screenshots Needed:**
- iPhone: 6.7", 6.5", 5.5" displays
- iPad: 12.9", 11" displays  
- Android: Phone and tablet sizes

**Store Descriptions:**
- App title: "IYKYK"
- Short description: "Discover trendy spots and gym classes"
- Full description: "Location-based discovery app for finding Instagram-worthy cafes, restaurants, and fitness classes. Gamified experience with badges, challenges, and rewards."

### 4. App Store Policies Compliance

**Privacy Policy Required** - Must include:
- Location data collection and usage
- User data storage and processing
- Third-party services used

**Age Rating:**
- Apple: 12+ (occasional mild suggestive themes)
- Google: Teen (simulated gambling, suggestive themes)

**Location Permissions:**
- "When in Use" permission for spot discovery
- Clear explanation of why location is needed

## Current File Structure
```
├── android/                 # Android native project
├── ios/                    # iOS native project
├── capacitor.config.ts     # Capacitor configuration
├── client/                 # Web app source
└── server/                # Backend API
```

## Development Commands
```bash
# Build web app
npm run build

# Copy web assets to native projects
npx cap copy

# Sync changes to native projects
npx cap sync

# Open in IDEs
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio

# Run on device
npx cap run ios --device
npx cap run android --device
```

## Technical Notes
- App uses PostgreSQL database with Replit deployment
- Location services use Capacitor's Geolocation plugin
- Valley Girl theme with pink/purple gradient (#ff69b4)
- PWA-compatible for web installation
- Mobile-first responsive design

## Ready for Production
IYKYK is now production-ready with:
- Database persistence
- Mobile-optimized interface  
- Native device features
- App store compliance structure
- Location-based functionality framework

Next step: Set up developer accounts and follow platform-specific deployment processes.