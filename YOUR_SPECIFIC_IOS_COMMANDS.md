# Your Specific iOS Terminal Commands

## Step 1: Open Terminal and Navigate to Project
```bash
cd /Users/adamfenelon/Desktop/Socialiser
cd ios/App
```

## Step 2: Install CocoaPods Dependencies
```bash
pod install
```

## Step 3: Open Xcode with the Workspace
```bash
open App.xcworkspace
```

## Alternative: Open Xcode First
If the `open` command doesn't work:
```bash
# Just run pod install
pod install

# Then manually open Xcode and select:
# File → Open → Navigate to ios/App.xcworkspace
```

## Complete Sequence (Copy-Paste Ready):
```bash
cd /Users/adamfenelon/Desktop/Socialiser/ios/App
pod install
open App.xcworkspace
```

## What This Does:
- `pod install` downloads all iOS dependencies (takes 1-2 minutes)
- `open App.xcworkspace` launches Xcode with your Socialiser project
- Xcode will load with all native iOS configurations ready

## In Xcode:
1. Select your iPhone device or simulator
2. Click the Play button (▶️) to build and run
3. App installs on your iPhone with full location and networking

Your iPhone will connect to the live production server and display the 20 London spots we just verified working.