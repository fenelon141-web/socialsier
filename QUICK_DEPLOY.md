# Quick Deploy Commands for App Store

## Terminal Commands (Run in Project Root)

```bash
# 1. Build the web app
npm run build

# 2. Sync to iOS project  
npx cap sync ios

# 3. Open in Xcode
npx cap open ios
```

## Xcode Steps (In Order)

1. **Set Bundle ID**: Select App target → Signing & Capabilities → Bundle Identifier: `com.yourname.socialiser`

2. **Set Team**: Select your Apple Developer team in the dropdown

3. **Archive**: Product → Archive (ensure "Any iOS Device" is selected)

4. **Upload**: After archive → Distribute App → App Store Connect → Upload

## App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Create new app with same Bundle ID
3. Upload screenshots and fill metadata
4. Select your uploaded build
5. Submit for Review

## That's it! 
Your Socialiser app will be reviewed and published to the App Store within 24-48 hours.