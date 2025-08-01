# Socialiser App Store Build Instructions

## Prerequisites
- macOS with Xcode 15+ installed
- Valid Apple Developer account ($99/year)
- iOS device for testing (optional but recommended)

## Step 1: Build iOS App with Capacitor
```bash
# Install dependencies if not done already
npm install

# Build the web app
npm run build

# Add iOS platform (if not already added)
npx cap add ios

# Sync web assets to iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

## Step 2: Xcode Configuration

### A. Set App Identity
1. In Xcode, select the project root "App"
2. Go to "Signing & Capabilities" tab
3. Set Team: Your Apple Developer Team
4. Bundle Identifier: `com.yourcompany.socialiser` (must be unique)
5. Enable "Automatically manage signing"

### B. App Information
1. Select "Info" tab
2. Set Display Name: "Socialiser"
3. Set Version: "1.0"
4. Set Build: "1"

### C. App Icons & Launch Screen
1. Assets are already configured in `ios/App/App/Assets.xcassets/`
2. App icons: 1024x1024 for App Store, various sizes for device
3. Launch screen: Already configured with Socialiser branding

## Step 3: Build for App Store

### Archive Build
```bash
# In Xcode:
# 1. Select "Any iOS Device (arm64)" as destination
# 2. Product → Archive
# 3. Wait for build to complete
```

### Upload to App Store Connect
```bash
# After archive completes:
# 1. Click "Distribute App"
# 2. Select "App Store Connect"
# 3. Click "Upload"
# 4. Sign with your Apple ID
# 5. Wait for upload to complete
```

## Step 4: App Store Connect Setup

### Create App Listing
1. Go to https://appstoreconnect.apple.com
2. Create new app with same Bundle ID
3. Fill in app metadata:
   - Name: "Socialiser"
   - Subtitle: "Discover Trendy Spots"
   - Description: See APP_STORE_DESCRIPTION.md
   - Keywords: "social,discovery,food,fitness,location,trendy,spots"
   - Category: "Social Networking" or "Lifestyle"

### App Screenshots (Required)
- 6.7" iPhone 14 Pro Max: 1290x2796 pixels
- 6.5" iPhone: 1242x2688 pixels  
- 5.5" iPhone: 1242x2208 pixels
- 12.9" iPad Pro: 2048x2732 pixels

### App Review Information
- Demo Account: Create test account for reviewers
- Review Notes: "Location permission required for core functionality"
- Contact Information: Your support email/phone

## Step 5: Submit for Review

### Before Submission Checklist
- [ ] All screenshots uploaded
- [ ] App description complete
- [ ] Privacy policy URL set
- [ ] Age rating completed
- [ ] Build uploaded and selected
- [ ] Pricing set (Free)
- [ ] Release type selected (Manual/Automatic)

### Submit Commands
```bash
# No terminal commands needed - use App Store Connect web interface:
# 1. Select your uploaded build
# 2. Complete all required metadata
# 3. Click "Submit for Review"
```

## Step 6: Review Process
- Review time: 24-48 hours typically
- Apple will test location features, authentication, and core functionality
- Check email for any rejection feedback
- Address any issues and resubmit if needed

## Troubleshooting

### Common Build Issues
```bash
# Clean build folder
rm -rf ios/App/build/

# Reset Capacitor
npx cap sync ios --force

# Update iOS platform
npx cap update ios
```

### Bundle ID Issues
- Must be unique globally
- Use reverse domain: com.yourcompany.socialiser
- Match exactly between Xcode and App Store Connect

### Signing Issues
- Ensure valid Apple Developer membership
- Check provisioning profiles in Xcode
- Try manual signing if automatic fails

## Success! 🎉
Once approved, your app will be live on the App Store and users can download Socialiser to discover trendy spots in their area!

## Support
- Apple Developer Support: https://developer.apple.com/support/
- App Store Connect Help: https://help.apple.com/app-store-connect/