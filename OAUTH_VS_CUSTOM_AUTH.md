# Authentication System Explanation

## Current Setup: Two Authentication Systems

Your app has **two different authentication systems**:

### 1. Replit OAuth (Web Only)
- **Redirect URI:** `https://your-replit-domain.replit.app/api/callback`
- **Used for:** Web browser development on Replit
- **Problem:** Doesn't work in iOS apps (redirect URI mismatch)

### 2. Custom Email/Password (Mobile Ready) ✅
- **No redirect URI needed** - uses direct HTTP requests
- **Used for:** Mobile apps, iOS, Android
- **Works everywhere:** Browser, iOS Simulator, real iPhone

## For iOS Testing: Use Custom Auth

The redirect URI issue you're experiencing is from trying to use Replit's OAuth in a mobile environment. The solution is to use your custom authentication system instead.

**Custom auth flow:**
1. User enters email/password in mobile app
2. App sends POST request to `/api/auth/login`
3. Server validates credentials and creates session
4. No redirects, no OAuth complexity

## iOS Testing Commands (No Server Needed)

Since we're using bundled assets, the development server doesn't need to run:

```bash
# Kill any existing server process
pkill -f "tsx server/index.ts"

# Build production bundle
npm run build

# Sync to iOS
npx cap sync ios  

# Open Xcode
npx cap open ios
```

## Testing Authentication on iPhone

1. Connect iPhone via USB-C
2. Select iPhone as target in Xcode
3. Run app on device
4. Create account using custom email/password system:
   - Email: test@example.com
   - Password: password123
5. Login works immediately - no redirect URIs needed

## Why This Is Better for Mobile

- **No OAuth redirects** (eliminates redirect URI issues)
- **Direct HTTP authentication** (works on any platform)
- **Session-based** (standard web authentication)
- **Mobile-optimized** (designed for apps, not just browsers)

Your custom authentication system is actually superior for mobile deployment compared to OAuth redirects.