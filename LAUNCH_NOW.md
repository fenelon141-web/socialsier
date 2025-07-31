# Launch Socialiser to App Store - Step by Step

## You Have: ✅
- Downloaded ZIP file of your project
- Apple Developer account approved
- Complete app ready for submission

## Next Steps to Go Live:

### Step 1: Extract and Setup Project (5 minutes)
```bash
# Extract ZIP file to Desktop or Documents
# Open Terminal and navigate to project
cd Desktop/socialiser-main  # (or your extracted folder name)

# Install dependencies
npm install
```

### Step 2: Create App Icon (30 minutes)
**Quick DIY Option:**
1. Go to Canva.com
2. Create custom size: 1024x1024 pixels
3. Add gradient background: Pink (#ff69b4) to Purple (#9b59b6)
4. Add large white "S" in center (bold font)
5. Download as PNG
6. Save as "app-icon.png"

### Step 3: Build iOS App (15 minutes)
```bash
# Build the web app
npm run build

# Copy to iOS project
npx cap copy ios

# Open in Xcode
npx cap open ios
```

### Step 4: Configure in Xcode (10 minutes)
**In Xcode when it opens:**
1. Click project name in left panel
2. Under "Signing & Capabilities":
   - Select your Apple Developer Team
   - Change Bundle Identifier to: `com.socialiser.app`
3. Under "General":
   - Display Name: `Socialiser`
   - Version: `1.0.0`
   - Add your app icon (drag app-icon.png to icon slots)

### Step 5: Archive and Upload (10 minutes)
**In Xcode:**
1. Select "Any iOS Device" from device dropdown
2. Menu: Product → Archive
3. When done, click "Distribute App"
4. Choose "App Store Connect"
5. Follow prompts to upload

### Step 6: App Store Connect Setup (20 minutes)
1. Go to appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - App Name: Socialiser
   - Bundle ID: com.socialiser.app
   - SKU: socialiser-001
4. Add app information:
   - Description: Copy from `APP_STORE_DESCRIPTION.md`
   - Keywords: social,location,discovery,spots,trendy,cafes
   - Age Rating: 12+
   - Privacy Policy URL: Add your hosted privacy policy

### Step 7: Submit for Review (5 minutes)
1. Upload screenshots (take from your running app)
2. Click "Submit for Review"
3. Answer review questions
4. Submit!

## Timeline from Now:
- **Today (2 hours)**: Complete steps 1-7
- **1-7 days**: Apple review process
- **Go Live**: Your app appears in App Store!

## Required Screenshots:
Take these from your app running locally:
- Login/Register screen
- Home dashboard
- Map view with spots
- Badge collection
- Profile page

**Screenshot sizes needed:**
- iPhone 14 Pro Max (6.7")
- iPhone 14 Plus (6.5")
- iPhone 8 Plus (5.5")

## Troubleshooting:

**If Xcode won't open:**
- Install Xcode from Mac App Store first
- Make sure you're on macOS

**If build fails:**
```bash
# Clean and rebuild
rm -rf node_modules
npm install
npm run build
```

**If signing fails:**
- Make sure Apple Developer account is fully approved
- Check team selection in Xcode

## You're Almost There!
Your app is complete and ready. These steps will get you live in the App Store within a week. The hardest part (building the app) is done - now it's just following the submission process.

Start with Step 1 and work through each step. You'll have your app submitted today!