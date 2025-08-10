# iOS Production Build Guide for Socialiser

## Prerequisites Setup

### 1. Apple Developer Account
- Enroll in Apple Developer Program (£79/year for UK)
- Complete identity verification process
- Set up certificates and provisioning profiles

### 2. Xcode Configuration
```bash
# Install Xcode from App Store (latest version)
# Install Xcode Command Line Tools
xcode-select --install
```

## Production Build Process

### Step 1: Update Capacitor Configuration
```bash
# Build the web app for production
npm run build

# Copy web assets to iOS
npx cap copy ios

# Update iOS project with latest changes
npx cap update ios
```

### Step 2: Open in Xcode
```bash
# Open the iOS project in Xcode
npx cap open ios
```

### Step 3: Configure for Production in Xcode

#### A. Bundle Identifier & Signing
1. Select the "App" target in Xcode
2. Go to "Signing & Capabilities" tab
3. Set Bundle Identifier: `com.socialiser.app`
4. Enable "Automatically manage signing"
5. Select your Apple Developer team

#### B. App Information
1. Go to "General" tab
2. Set Display Name: "Socialiser"
3. Set Version: 1.0.0
4. Set Build: 1

#### C. Deployment Target
1. Set iOS Deployment Target: 14.0 or higher
2. Ensure all capabilities are properly configured

### Step 4: Add App Icons
1. Navigate to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
2. Add all required icon sizes (see icon requirements)
3. Verify icons appear in Xcode's asset catalog

### Step 5: Configure Capabilities
Enable these in "Signing & Capabilities":
- Location Services (When In Use)
- Push Notifications
- Camera access
- Photo Library access

### Step 6: Build for App Store
1. Select "Any iOS Device" or "Generic iOS Device" as target
2. Choose "Product" → "Archive" in Xcode menu
3. Wait for archive to complete (5-15 minutes)

### Step 7: Upload to App Store Connect
1. When archive completes, Xcode Organizer opens
2. Select your archive and click "Distribute App"
3. Choose "App Store Connect"
4. Follow the upload wizard
5. Upload will take 10-30 minutes

## Configuration Files Updated

### Info.plist Permissions (COMPLETED)
- Enhanced location usage descriptions
- Added camera and photo library permissions
- Added notification permissions
- All descriptions clearly explain usage purpose

### Capacitor Config (READY)
- Bundle ID: `com.socialiser.app`
- App Name: "Socialiser"
- Proper iOS configuration

## TestFlight Testing Process

### After Upload to App Store Connect:
1. **Processing:** Apple processes your build (1-2 hours)
2. **Internal Testing:**
   - Add internal testers in App Store Connect
   - Distribute via TestFlight
   - Test all core features thoroughly

3. **External Testing (Optional):**
   - Add external beta testers (up to 25 without review)
   - Get real user feedback before public release

### Testing Checklist:
- [ ] App launches successfully
- [ ] Location permissions work correctly
- [ ] Spot discovery and map functionality
- [ ] Check-in verification works
- [ ] Social features function properly
- [ ] Push notifications arrive correctly
- [ ] Camera and photo sharing work
- [ ] No crashes or performance issues

## Common Build Issues & Solutions

### Issue 1: Code Signing Errors
**Solution:**
- Ensure Apple Developer account is active
- Refresh provisioning profiles in Xcode
- Clean build folder (Product → Clean Build Folder)

### Issue 2: Missing Permissions
**Solution:**
- Verify all NSUsageDescription keys in Info.plist
- Test permission requests on device
- Update descriptions if rejected by Apple

### Issue 3: Bundle ID Conflicts
**Solution:**
- Ensure Bundle ID matches App Store Connect app
- Bundle ID must be unique across App Store
- Cannot change Bundle ID after first upload

### Issue 4: Icon/Asset Issues
**Solution:**
- Verify all required icon sizes are included
- Ensure icons are PNG format, no transparency
- Check that icons display correctly in Xcode

## Automated Build Script (Optional)

Create `scripts/build-ios.sh`:
```bash
#!/bin/bash
echo "Building Socialiser for iOS..."

# Build web app
npm run build

# Update iOS
npx cap copy ios
npx cap update ios

echo "Ready for Xcode! Run: npx cap open ios"
echo "Then archive and upload to App Store Connect"
```

## Post-Build Verification

### Before Submitting to Apple:
1. **Test on Real Devices:**
   - iPhone (various sizes)
   - iPad (if supporting)
   - Different iOS versions

2. **Performance Testing:**
   - App launch time < 3 seconds
   - Smooth scrolling and animations
   - No memory leaks or crashes

3. **Feature Testing:**
   - All core features work offline/online
   - Location accuracy and permissions
   - Social features and data sync

## App Store Connect Submission

### Required Information:
- App description (from app-store-assets/)
- Keywords and categories
- Screenshots for all device sizes
- Privacy policy URL
- Terms of service URL
- Support URL
- Age rating responses

### Review Process:
- Apple review: 1-7 days typically
- Common rejection reasons addressed
- App meets all guidelines

## What Requires Xcode vs Can Be Done Here

### ✅ Completed in This Project:
- Info.plist permission descriptions
- Capacitor configuration
- Bundle ID setup
- App naming and metadata

### ⚠️ Requires Xcode:
- Code signing and certificates
- Final production build compilation
- Archive creation for App Store
- TestFlight distribution setup
- Actual device testing

### 💻 Requires Apple Developer Account:
- Certificate generation
- Provisioning profile creation
- App Store Connect app creation
- TestFlight testing coordination

## Next Steps Summary

1. **Immediate (Can do now):**
   - Build production web app: `npm run build`
   - Copy to iOS: `npx cap copy ios`

2. **Requires Apple Developer Account:**
   - Set up certificates and provisioning
   - Create app in App Store Connect

3. **Requires Xcode on Mac:**
   - Configure signing and capabilities
   - Build and archive for App Store
   - Upload to App Store Connect

4. **Requires Physical iOS Devices:**
   - TestFlight testing
   - Real-world performance validation
   - User acceptance testing

The foundation is ready - you'll need a Mac with Xcode to complete the build process.