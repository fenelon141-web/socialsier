# Fixed iOS Simulator Commands

## The Problem
The server port configuration was causing a conflict. Here's the fix:

## Step 1: Kill Any Existing Processes
```bash
# Kill any process using port 5000
sudo kill -9 $(sudo lsof -t -i:5000) 2>/dev/null || echo "No process on port 5000"

# Alternative: use a different port
PORT=3001 npm run dev
```

## Step 2: Start Development Server
```bash
# Method 1: Use default port (now fixed)
npm run dev

# Method 2: Use alternative port if needed
PORT=3001 npm run dev
```

## Step 3: Update Capacitor for Alternative Port (if using PORT=3001)
If you used PORT=3001, update capacitor.config.ts temporarily:
```typescript
url: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:3001' : undefined,
```

## Step 4: Sync and Open iOS
```bash
# Sync with updated config
npx cap sync ios

# Open in Xcode
npx cap open ios
```

## Step 5: Test Authentication in iOS Simulator
1. **Create Account:**
   - Username: testuser
   - Email: test@example.com
   - Password: password123

2. **Login:**
   - Email: test@example.com
   - Password: password123

## Alternative: Build for Physical Device
If simulator continues having issues, build for physical device:

```bash
# In Xcode:
# 1. Connect iPhone via USB
# 2. Select your iPhone as target (not simulator)
# 3. Product → Run
# 4. Authentication will work perfectly on real device
```

## Why This Fixes It
- Removed `reusePort` option (not supported on macOS)
- Simplified server listening configuration
- Alternative port option if 5000 is blocked
- Custom auth system works on both simulator and device

The authentication error will be resolved once the server starts properly.