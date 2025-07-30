# Socialiser - Production Build Instructions

## Prerequisites
- Node.js and npm installed
- Xcode installed (for iOS builds)
- Android Studio installed (for Android builds)
- Apple Developer account (for iOS submission)
- Google Play Console account (for Android submission)

## Build Process

### 1. Prepare for Production Build

```bash
# Install dependencies (if not already done)
npm install

# Update version number in package.json
# Change "version": "1.0.0" to your desired version

# Set production environment
export NODE_ENV=production
```

### 2. Create Web Build

```bash
# Build the web application
npm run build

# This creates optimized files in dist/ directory
# Verify build completed successfully
ls -la dist/
```

### 3. iOS Build Process

```bash
# Copy web assets to iOS project
npx cap copy

# Sync changes with iOS project  
npx cap sync ios

# Open iOS project in Xcode
npx cap open ios
```

**In Xcode:**
1. Select your project in the navigator
2. Go to "Signing & Capabilities" tab
3. Select your Apple Developer Team
4. Update Bundle Identifier to: `com.socialiser.app`
5. Update Display Name to: `Socialiser`
6. Update Version to: `1.0.0`
7. Update Build number (increment for each submission)

**Build for App Store:**
1. Select "Any iOS Device" from the device menu
2. Product → Archive
3. When archive completes, click "Distribute App"
4. Choose "App Store Connect"
5. Follow prompts to upload

### 4. Android Build Process

```bash
# Copy web assets to Android project
npx cap copy

# Sync changes with Android project
npx cap sync android

# Open Android project in Android Studio
npx cap open android
```

**In Android Studio:**
1. Open `android/app/build.gradle`
2. Update `versionCode` (increment for each release)
3. Update `versionName` to `"1.0.0"`
4. Update `applicationId` to `"com.socialiser.app"`

**Build for Play Store:**
1. Build → Generate Signed Bundle / APK
2. Choose "Android App Bundle"
3. Create or select signing key
4. Choose "release" build variant
5. Generate bundle (produces .aab file)

### 5. Testing Builds

**iOS Testing:**
- Test on physical iOS device before submission
- Use TestFlight for beta testing (optional)
- Verify all features work: location, camera, notifications

**Android Testing:**
- Test on physical Android device
- Use Google Play Console internal testing (optional)
- Test on different Android versions if possible

## Environment Variables

### Production Environment Variables Needed:
```bash
# Database
DATABASE_URL=your_production_database_url

# Sessions
SESSION_SECRET=your_secure_session_secret

# Google Maps (if using)
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Other production settings
NODE_ENV=production
```

## Database Setup for Production

### Option 1: Neon (Recommended)
```bash
# Create Neon database account at neon.tech
# Get connection string
# Update DATABASE_URL in your environment
```

### Option 2: Railway
```bash
# Create Railway account
# Deploy PostgreSQL database
# Use provided connection string
```

### Option 3: Supabase
```bash
# Create Supabase project
# Use PostgreSQL connection details
# Update DATABASE_URL
```

## Deployment Checklist

### Before Building:
- [ ] Test all features work locally
- [ ] Update app version number
- [ ] Set production environment variables
- [ ] Test database connection
- [ ] Verify privacy policy and terms URLs work

### iOS Submission:
- [ ] App built and archived in Xcode
- [ ] Uploaded to App Store Connect
- [ ] App metadata filled in (description, keywords, screenshots)
- [ ] Age rating set to 12+
- [ ] Privacy policy URL added
- [ ] App submitted for review

### Android Submission:
- [ ] App bundle (.aab) generated
- [ ] Uploaded to Google Play Console
- [ ] App metadata filled in
- [ ] Screenshots uploaded
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL added
- [ ] App submitted for review

## Common Build Issues

### iOS Issues:
```bash
# Code signing errors
# Solution: Ensure proper Apple Developer team selected

# Build failures
# Solution: Clean build folder (Cmd+Shift+K) and rebuild

# Capacitor sync issues
# Solution: Delete ios/App/App/public and run npx cap sync ios
```

### Android Issues:
```bash
# Gradle build errors
# Solution: ./gradlew clean in android/ directory

# Signing key issues  
# Solution: Generate new signing key following Android documentation

# Capacitor sync issues
# Solution: Delete android/app/src/main/assets/public and run npx cap sync android
```

## Post-Submission

### After Submitting to App Stores:
1. **Monitor Review Status**: Check App Store Connect and Play Console daily
2. **Respond to Feedback**: Address any reviewer comments quickly  
3. **Prepare Marketing**: Plan launch announcement and social media
4. **Monitor Analytics**: Set up app analytics for post-launch insights

### If Rejected:
1. **Read Feedback Carefully**: Understand specific rejection reasons
2. **Fix Issues**: Address all mentioned problems
3. **Test Thoroughly**: Ensure fixes work properly
4. **Resubmit**: Upload new build and resubmit

## Success Metrics to Track
- Downloads and installs
- User registrations  
- Location permissions granted
- Active daily/monthly users
- Spot check-ins completed
- User retention rates

Your app is ready for production! Follow these steps carefully and you'll have Socialiser live in the App Store and Google Play soon.