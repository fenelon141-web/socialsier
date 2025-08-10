# iOS Podfile Fix for Exported Project

## The Problem
When exporting the iOS project, the Podfile references `node_modules` which doesn't exist in the exported zip. This is because Capacitor normally expects the iOS project to be inside a larger npm project structure.

## Solution: Use Standalone Podfile

### Option 1: Replace the Current Podfile
1. Delete the current `Podfile` in your iOS project:
   ```bash
   cd /Users/adamfenelon/Desktop/Socialiser/ios/App
   rm Podfile
   ```

2. Copy the standalone version:
   ```bash
   cp Podfile.standalone Podfile
   ```

3. Install pods:
   ```bash
   pod install
   ```

### Option 2: Quick Fix (Simpler)
Just replace the problematic line in your current Podfile:

1. Open `Podfile` in a text editor
2. Replace the first line:
   ```ruby
   require_relative '../../node_modules/@capacitor/ios/scripts/pods_helpers'
   ```
   With this content:
   ```ruby
   platform :ios, '13.0'
   use_frameworks!

   target 'App' do
     pod 'Capacitor', '~> 6.0'
     pod 'CapacitorCordova', '~> 6.0'
     pod 'CapacitorApp', '~> 6.0'
     pod 'CapacitorCamera', '~> 6.0'
     pod 'CapacitorDevice', '~> 6.0'
     pod 'CapacitorGeolocation', '~> 6.0'
     pod 'CapacitorSplashScreen', '~> 6.0'
     pod 'CapacitorStatusBar', '~> 6.0'
   end
   ```

3. Run `pod install`

## What This Does
- Removes dependency on `node_modules` structure
- Downloads Capacitor dependencies directly from CocoaPods
- Maintains all the native iOS functionality
- Makes the project truly standalone

## After Pod Install Success
You should see:
- `Pods/` folder created
- `App.xcworkspace` file generated
- All Capacitor plugins properly integrated

Then you can open `App.xcworkspace` in Xcode and build normally.

## Verification
Your iOS project is working correctly when:
- Xcode builds without errors
- All Capacitor plugins are recognized
- App runs on device/simulator
- Location and camera permissions work