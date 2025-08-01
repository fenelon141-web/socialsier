# Custom URL Scheme Authentication Setup

## What You've Configured

I've set up your iOS app to handle the custom URL scheme: `com.adamfenelon.iykyk://auth/callback?token=abc123`

## Changes Made

### 1. App Configuration
- **App ID:** Changed to `com.adamfenelon.iykyk`
- **App Name:** Changed to "IYKYK"
- **URL Scheme:** Configured to handle `com.adamfenelon.iykyk://` deep links

### 2. iOS Info.plist Updated
Added URL scheme handler for authentication callbacks from external providers.

### 3. Deep Link Authentication System
Created a complete authentication system that:
- Listens for deep link callbacks
- Extracts tokens from URLs
- Stores authentication data
- Integrates with your existing auth system

## How It Works

### Authentication Flow
1. User initiates login (web or external provider)
2. External auth redirects to: `com.adamfenelon.iykyk://auth/callback?token=abc123&userId=123&email=user@example.com`
3. iOS app opens and captures the deep link
4. App extracts token and user info
5. User is automatically logged in

### Testing the Deep Link
```bash
# Build with new configuration
npm run build

# Sync iOS with URL scheme
npx cap sync ios

# Open in Xcode
npx cap open ios

# Test deep link in iOS Simulator:
# Device → Trigger Deep Link → paste: com.adamfenelon.iykyk://auth/callback?token=test123
```

## Integration Options

### Option 1: External OAuth Provider
If using Firebase, Auth0, or another provider:
- Configure their redirect URI to: `com.adamfenelon.iykyk://auth/callback`
- They'll append the token parameter
- Your app will automatically handle the response

### Option 2: Custom Backend
If building custom auth:
- After successful login, redirect to: `com.adamfenelon.iykyk://auth/callback?token={jwt_token}&userId={user_id}`
- App captures and processes the authentication

## Current Status
- URL scheme configured ✅
- Deep link listener implemented ✅
- Token storage system ready ✅
- Ready for external authentication integration ✅

Your app can now handle professional mobile authentication flows with proper deep linking!