import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.socialiser.app',
  appName: 'Socialiser',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    // For iOS Simulator - point to your local development server
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : undefined,
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
    StatusBar: {
      style: "light",
      backgroundColor: "#ff69b4"
    },
    Geolocation: {
      permissions: {
        location: "always"
      }
    }
  }
};

export default config;
