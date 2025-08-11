# How to Open iOS Project in Xcode

## The Issue:
You're opening the wrong file type. iOS projects with CocoaPods need the `.xcworkspace` file, not the folder or `.xcodeproj`.

## Correct Way to Open:

### Option 1: From Xcode
1. Open Xcode
2. File → Open
3. Navigate to: `ios/App/`
4. **Select: `App.xcworkspace`** (NOT `App.xcodeproj`)
5. Click Open

### Option 2: From Terminal
```bash
cd ios/App
open App.xcworkspace
```

### Option 3: From Finder
- Navigate to your ios/App folder
- **Double-click `App.xcworkspace`**

## Why Workspace Not Project:
- `.xcworkspace` includes CocoaPods dependencies
- `.xcodeproj` alone doesn't have the required libraries
- Capacitor iOS projects always need the workspace

## After Opening:
You should see the full project structure with all source files, and you can build and run on your iPhone.

## Expected Files Structure:
```
App.xcworkspace  ← Open THIS
App.xcodeproj    ← NOT this
Podfile
App/
  ├── App/
  │   ├── Info.plist
  │   ├── AppDelegate.swift
  │   └── public/ (your web assets)
```