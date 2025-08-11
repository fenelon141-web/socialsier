# iOS CocoaPods Setup Commands

## After downloading and extracting the updated iOS project:

```bash
# Navigate to the iOS project directory
cd path/to/your/ios/App

# Install CocoaPods dependencies
pod install

# If you get permission errors, try:
sudo gem install cocoapods
pod install

# If pods are outdated:
pod update

# If you need to clean and reinstall:
pod deintegrate
pod install
```

## Then Open in Xcode:
```bash
# Open the workspace (not the project file)
open App.xcworkspace
```

## Alternative if Terminal Commands Fail:
1. Open Xcode
2. File → Open → Navigate to your iOS folder
3. Open `App.xcworkspace` (not App.xcodeproj)
4. Build and run

## Expected Result:
Your iPhone will now display the 20 spots that the server has been finding (Chai Spot, Morrisons Cafe, etc.) via WebSocket instead of the failing HTTP requests.