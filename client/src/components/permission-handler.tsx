import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, Bell } from "lucide-react";
import { useCapacitor } from "@/hooks/use-capacitor";

interface PermissionHandlerProps {
  children: React.ReactNode;
}

export default function PermissionHandler({ children }: PermissionHandlerProps) {
  const { isNative } = useCapacitor();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (!isNative) {
      // For web version, check browser permissions
      if ('geolocation' in navigator) {
        try {
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          setLocationPermission('granted');
        } catch {
          setLocationPermission('denied');
        }
      }

      if ('Notification' in window) {
        const permission = Notification.permission;
        setNotificationPermission(permission === 'granted' ? 'granted' : permission === 'denied' ? 'denied' : 'pending');
      }

      // For web, we consider permissions granted if location works
      setPermissionsGranted(locationPermission === 'granted');
    } else {
      // For native app, all permissions are handled during app install
      setPermissionsGranted(true);
    }
  };

  const requestLocationPermission = async () => {
    if (!('geolocation' in navigator)) {
      setLocationPermission('denied');
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      setLocationPermission('granted');
      checkPermissions();
    } catch (error) {
      setLocationPermission('denied');
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('denied');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission === 'granted' ? 'granted' : 'denied');
      checkPermissions();
    } catch (error) {
      setNotificationPermission('denied');
    }
  };

  // Show permission screen for web users
  if (!isNative && !permissionsGranted && locationPermission !== 'granted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-gradient rounded-2xl shadow-2xl border-0">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
              S
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Enable Permissions
            </CardTitle>
            <p className="text-gray-600">
              Socialiser needs a few permissions to help you discover amazing spots
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-pink-50 rounded-xl">
                <MapPin className="w-6 h-6 text-pink-500" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Location Access</h3>
                  <p className="text-sm text-gray-600">Find trendy spots near you and verify check-ins</p>
                </div>
                {locationPermission === 'granted' && <span className="text-green-500">✓</span>}
              </div>

              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                <Bell className="w-6 h-6 text-purple-500" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">Get alerted about trending spots nearby</p>
                </div>
                {notificationPermission === 'granted' && <span className="text-green-500">✓</span>}
              </div>
            </div>

            {locationPermission !== 'granted' && (
              <Button
                onClick={requestLocationPermission}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl py-3 text-lg font-semibold"
              >
                Enable Location Access
              </Button>
            )}

            {locationPermission === 'granted' && notificationPermission !== 'granted' && (
              <Button
                onClick={requestNotificationPermission}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-xl py-3 text-lg font-semibold"
              >
                Enable Notifications
              </Button>
            )}

            {locationPermission === 'granted' && (
              <Button
                onClick={() => setPermissionsGranted(true)}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl py-3 text-lg font-semibold"
              >
                Continue to App
              </Button>
            )}

            <p className="text-center text-xs text-gray-500">
              These permissions help us provide the best spot discovery experience. You can change them anytime in your browser settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}