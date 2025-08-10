# Exact Terminal Commands to Fix Podfile Issue

## The Problem:
- Xcode shows "No such module 'Capacitor'" error
- Podfile references `node_modules` which doesn't exist in exported project

## Solution Commands:

### Step 1: Navigate to Your iOS Project
```bash
cd /Users/adamfenelon/Desktop/Socialiser/ios/App
```

### Step 2: Clean Any Existing Pods
```bash
rm -rf Pods/
rm -f Podfile.lock
```

### Step 3: Replace Podfile Content
```bash
cat > Podfile << 'EOF'
platform :ios, '13.0'
use_frameworks!

# workaround to avoid Xcode caching of Pods that requires
# Product -> Clean Build Folder after new Cordova plugins installed
# Requires CocoaPods 1.6 or newer
install! 'cocoapods', :disable_input_output_paths => true

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

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
    end
  end
end
EOF
```

### Step 4: Install Pods
```bash
pod install
```

### Step 5: Open Workspace (NOT .xcodeproj)
```bash
open App.xcworkspace
```

## Expected Output:
After `pod install` you should see:
```
Analyzing dependencies
Downloading dependencies
Installing Capacitor (6.x.x)
Installing CapacitorApp (6.x.x)
...
Generating Pods project
```

## Verification:
- No more "No such module 'Capacitor'" error
- Xcode builds successfully
- App runs on device/simulator

## Alternative: Download Updated Version
I've created `socialiser-ios-standalone.tar.gz` with the fixed Podfile already included.