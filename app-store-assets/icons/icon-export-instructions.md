# How to Export App Icons from SVG

## Required PNG Sizes

The `socialiser-app-icon.svg` file needs to be exported to these PNG sizes:

### App Store Icon (Required)
- **1024x1024 pixels** - For App Store listing

### iOS App Bundle Icons (Required for Xcode)
- **180x180 pixels** - iPhone @3x
- **120x120 pixels** - iPhone @2x  
- **167x167 pixels** - iPad Pro @2x
- **152x152 pixels** - iPad @2x
- **76x76 pixels** - iPad @1x

### Additional Sizes (Optional)
- **87x87 pixels** - iPhone old @3x
- **58x58 pixels** - iPhone old @2x
- **29x29 pixels** - iPhone old @1x

## Export Methods

### Method 1: Online SVG to PNG Converter
1. Visit: https://cloudconvert.com/svg-to-png
2. Upload `socialiser-app-icon.svg`
3. Set width and height to desired size (e.g., 1024x1024)
4. Download the PNG file
5. Repeat for each required size

### Method 2: Figma (Free)
1. Create new Figma file
2. Import the SVG file
3. Select the icon and resize to target dimensions
4. Export as PNG at appropriate resolution
5. Repeat for all sizes

### Method 3: Adobe Illustrator
1. Open the SVG in Illustrator
2. File → Export → Export As
3. Choose PNG format
4. Set resolution and dimensions
5. Export each required size

### Method 4: Inkscape (Free)
1. Open SVG in Inkscape
2. File → Export PNG Image
3. Set width/height to target size
4. Export each required size

## File Naming Convention

Save the exported files as:
```
AppIcon-1024.png          (App Store)
AppIcon-180.png           (iPhone @3x)
AppIcon-167.png           (iPad Pro @2x)  
AppIcon-152.png           (iPad @2x)
AppIcon-120.png           (iPhone @2x)
AppIcon-87.png            (iPhone old @3x)
AppIcon-76.png            (iPad @1x)
AppIcon-58.png            (iPhone old @2x)
AppIcon-29.png            (iPhone old @1x)
```

## Quality Check

After exporting, verify:
- [ ] No transparency (solid background)
- [ ] Square format (1:1 aspect ratio)
- [ ] Sharp edges at all sizes
- [ ] Colors consistent across all sizes
- [ ] File sizes appropriate (not too large)

## Adding to Xcode Project

1. Open your iOS project in Xcode
2. Navigate to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
3. Replace the existing icon files with your new PNG files
4. Ensure the `Contents.json` file matches the icons you've added
5. Build and test on device to verify icons appear correctly

## Adding to App Store Connect

1. Log into App Store Connect
2. Go to your app → App Information
3. Upload the 1024x1024 PNG icon
4. Save changes

The Socialiser icon design features:
- Pink to purple gradient background (brand colors)
- White location pin with stylized "S" 
- Social connection elements (dots and lines)
- Sparkle effects for trendy, valley girl aesthetic
- Clean, modern design that works at all sizes