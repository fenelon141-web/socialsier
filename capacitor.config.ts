import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.socialiser.app',
  appName: 'Socialiser',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    allowNavigation: ['https://hot-girl-hunt-fenelon141.replit.app'],
    url: 'https://hot-girl-hunt-fenelon141.replit.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ff69b4",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },

    Geolocation: {
      permissions: {
        location: "whenInUse"
      }
    },
    App: {
      urlScheme: "com.socialiser.app"
    },
    Camera: {
      saveToGallery: false,
      allowEditing: true,
      correctOrientation: true,
      permissions: {
        camera: "whenInUse",
        photos: "whenInUse"
      }
    }
  }
};

export default config;
