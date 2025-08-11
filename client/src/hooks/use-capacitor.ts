import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
// StatusBar plugin removed for iOS compatibility
import { SplashScreen } from '@capacitor/splash-screen';
import { Device } from '@capacitor/device';

export function useCapacitor() {
  const [isNative, setIsNative] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    const initCapacitor = async () => {
      try {
        // Check if running in native app
        const info = await Device.getInfo();
        setDeviceInfo(info);
        setIsNative(info.platform !== 'web');

        if (info.platform !== 'web') {
          // StatusBar configuration removed for iOS compatibility
          
          // Hide splash screen after app loads
          await SplashScreen.hide();

          // Handle app state changes
          App.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed. Is active?', isActive);
          });

          // Handle back button on Android
          App.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              App.exitApp();
            } else {
              window.history.back();
            }
          });
        }
      } catch (error) {
        console.log('Error initializing Capacitor:', error);
        setIsNative(false);
      }
    };

    initCapacitor();

    return () => {
      // Cleanup listeners
      App.removeAllListeners();
    };
  }, []);

  return {
    isNative,
    deviceInfo,
  };
}