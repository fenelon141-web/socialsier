# Your Specific iOS Setup Commands

## Your Project Path:
`/Users/adamfenelon/Desktop/Socialiser`

## Terminal Commands for Your Setup:

```bash
# Navigate to your iOS App directory
cd /Users/adamfenelon/Desktop/Socialiser/ios/App

# Install CocoaPods dependencies
pod install

# Open in Xcode (correct workspace file)
open App.xcworkspace
```

## If pod install fails:
```bash
# Update CocoaPods first
sudo gem install cocoapods
cd /Users/adamfenelon/Desktop/Socialiser/ios/App
pod install
```

## Alternative Xcode Opening Methods:

### From Finder:
1. Navigate to: `/Users/adamfenelon/Desktop/Socialiser/ios/App/`
2. Double-click `App.xcworkspace`

### From Xcode:
1. File → Open
2. Navigate to: `/Users/adamfenelon/Desktop/Socialiser/ios/App/`
3. Select: `App.xcworkspace`

## What You Should See:
After opening the workspace, you'll see the full Socialiser project structure with all source files, and you can build the updated app with WebSocket functionality.

## Expected Result:
Your iPhone will display the 20 spots (Chai Spot, Morrisons Cafe, etc.) that have been successfully found by the server.