import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Bell, MapPin, Zap, Clock, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NotificationTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const { latitude, longitude } = useGeolocation();
  const { testNearby, isTracking, trendingNotifications, serviceStatus } = usePushNotifications();
  const { isAutoTrackingEnabled, enableAutoTracking, disableAutoTracking, lastUpdate } = useLocationTracking();
  const { toast } = useToast();

  const runNotificationTest = async () => {
    if (!latitude || !longitude) {
      toast({
        title: "Location Required",
        description: "Please enable location services to test notifications",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Testing Push Notifications",
      description: "Checking for trending spots nearby...",
    });

    try {
      const response = await fetch('/api/test-nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      
      const result = await response.json();
      setTestResults(result);
      
      if (result.newNotifications > 0) {
        toast({
          title: "Push Notifications Working! 🎉",
          description: `Found ${result.newNotifications} trending spots nearby`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Test Complete",
          description: "No new trending spots found right now",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Notification test error:', error);
      toast({
        title: "Test Failed",
        description: "Unable to test push notifications",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-600 rounded-full">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Push Notifications</h3>
              <p className="text-gray-600">Real-time trendy spot alerts</p>
            </div>
          </div>
          <Badge 
            variant={serviceStatus?.isRunning ? "default" : "destructive"}
            className={serviceStatus?.isRunning ? "bg-green-500" : "bg-red-500"}
          >
            {serviceStatus?.isRunning ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {latitude && longitude ? '✅' : '❌'}
            </div>
            <p className="text-sm text-gray-600">Location Access</p>
          </div>

          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <Target className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {trendingNotifications.length}
            </div>
            <p className="text-sm text-gray-600">Trending Alerts</p>
          </div>

          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-xs font-medium text-gray-800">
              {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
            </div>
            <p className="text-sm text-gray-600">Last Check</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-3">
            <Button
              onClick={runNotificationTest}
              disabled={isTracking || !latitude || !longitude}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isTracking ? 'Testing...' : 'Test Push Notifications'}
            </Button>

            {isAutoTrackingEnabled ? (
              <Button
                onClick={disableAutoTracking}
                variant="destructive"
                className="px-6"
              >
                Stop Auto
              </Button>
            ) : (
              <Button
                onClick={enableAutoTracking}
                variant="outline"
                className="px-6"
              >
                Auto-Track
              </Button>
            )}
          </div>

          {testResults && (
            <div className="p-4 bg-white rounded-xl shadow-sm border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Test Results</h4>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  Success
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">New Notifications:</span>
                  <span className="font-medium">{testResults.newNotifications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">
                    {testResults.location?.latitude.toFixed(4)}, {testResults.location?.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="font-medium">
                    {testResults.timestamp ? new Date(testResults.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>

              {testResults.recentNotifications?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="font-medium text-gray-700">Recent Notifications:</h5>
                  {testResults.recentNotifications.map((notif: any, index: number) => (
                    <div key={index} className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="font-medium text-gray-800">{notif.title}</div>
                      <div className="text-sm text-gray-600">{notif.message}</div>
                      {notif.spotName && (
                        <div className="text-xs text-pink-600 mt-1">
                          📍 {notif.spotName} • {notif.distance}m away
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {trendingNotifications.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
              <h4 className="font-semibold text-gray-800 mb-3">Recent Trending Notifications</h4>
              <div className="space-y-2">
                {trendingNotifications.slice(0, 3).map((notif, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 bg-white rounded-lg">
                    <div className="p-1 bg-pink-100 rounded-full">
                      <Bell className="w-3 h-3 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{notif.title}</div>
                      <div className="text-xs text-gray-600">{notif.message}</div>
                      <div className="text-xs text-pink-600 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}