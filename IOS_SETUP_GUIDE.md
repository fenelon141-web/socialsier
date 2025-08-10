# iOS Setup Guide for Socialiser

## Required Terminal Commands After Export

### 1. Navigate to iOS Project Directory
```bash
cd /path/to/your/exported/Socialiser/ios/App
```

### 2. Install CocoaPods Dependencies
```bash
pod install
```

This will:
- Download all iOS dependencies
- Create the `.xcworkspace` file
- Generate the missing Pods configuration files

### 3. Open Correct Xcode Project
```bash
open App.xcworkspace
```

**IMPORTANT:** Always open the `.xcworkspace` file, NOT the `.xcodeproj` file!

## If Pod Install Fails

### Update CocoaPods First:
```bash
sudo gem install cocoapods
pod repo update
```

### Then Try Again:
```bash
pod install --repo-update
```

## Xcode Setup Checklist

### Before Building:
1. **Select Development Team:** 
   - Go to App target → Signing & Capabilities
   - Select your Apple Developer account

2. **Update Bundle Identifier:**
   - Change from `io.ionic.starter` to your unique identifier
   - Example: `com.yourname.socialiser`

3. **Choose Device Target:**
   - Select your connected iPhone from device list
   - Or choose iOS Simulator

4. **Build Settings:**
   - Ensure iOS Deployment Target is 13.0 or higher
   - Verify Swift Language Version is Swift 5

### Common Build Issues:

**"Unable to find configuration files"**
- Solution: Run `pod install` in terminal

**"No such module 'Capacitor'"**  
- Solution: Clean build folder (Cmd+Shift+K), then rebuild

**"Code signing error"**
- Solution: Select your development team in signing settings

**"Device not found"**
- Solution: Ensure iPhone is connected and trusted

## Final Build Commands

### For Testing on Device:
1. Connect iPhone via USB
2. Trust computer on iPhone when prompted
3. In Xcode: Product → Run (Cmd+R)

### For App Store Archive:
1. Select "Any iOS Device" or your device
2. Product → Archive
3. Follow Xcode organizer for upload

## Troubleshooting

### If Capacitor Commands Don't Work:
```bash
npm install -g @capacitor/cli
npx cap sync ios
```

### If Location Services Fail:
- Check Info.plist has location usage descriptions
- Verify location permissions in iOS Settings → Privacy

### If WebSocket Doesn't Connect:
- Ensure app has internet permissions
- Check server URL is accessible from device
- Verify HTTPS certificate is valid

## Success Indicators

Your iOS app is working correctly when:
- App builds without errors in Xcode
- Location permission prompt appears on first launch
- Map loads with nearby spots
- WebSocket connects (check console logs)
- Check-in functionality works with proximity verification

## Next Steps After Successful Build

1. **Test Core Features:**
   - Location permission and GPS accuracy
   - Map loading with real spots
   - Hunt page proximity verification
   - Camera integration for photos

2. **Performance Testing:**
   - Battery usage during location tracking
   - App responsiveness on cellular vs WiFi
   - Background behavior

3. **App Store Preparation:**
   - Screenshots for App Store listing
   - App description and keywords
   - Review compliance checklist
   - Submit for review

Your iOS app is fully configured and ready for testing!