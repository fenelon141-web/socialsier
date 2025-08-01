import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/error-boundary";
import PermissionHandler from "@/components/permission-handler";
import Home from "@/pages/home";
import MapView from "@/pages/map";
import Social from "@/pages/social";
import Squads from "@/pages/squads";
import TasteMakers from "@/pages/taste-makers";
import DiscoverFeed from "@/pages/discover-feed";
import Badges from "@/pages/badges";
import Profile from "@/pages/profile";
import SimpleLogin from "@/pages/simple-login";
import Register from "@/pages/register";
import SetPassword from "@/pages/set-password";
import NotFound from "@/pages/not-found";

import { useCapacitor } from "./hooks/use-capacitor";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto animate-pulse">
            S
          </div>
          <p className="text-gray-600">Loading Socialiser...</p>
        </div>
      </div>
    );
  }

  // Show login/register pages if not authenticated
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/set-password" component={SetPassword} />
        <Route path="*" component={SimpleLogin} />
      </Switch>
    );
  }

  // Show main app if authenticated
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/map" component={MapView} />
      <Route path="/social" component={Social} />
      <Route path="/squads" component={Squads} />
      <Route path="/taste-makers" component={TasteMakers} />
      <Route path="/discover" component={DiscoverFeed} />
      <Route path="/badges" component={Badges} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isNative, deviceInfo } = useCapacitor();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <PermissionHandler>
            <div className="gradient-bg min-h-screen">
              <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative overflow-hidden">
                <Toaster />
                <Router />
                {isNative && (
                  <div className="hidden">
                    Mobile app mode: {deviceInfo?.platform}
                  </div>
                )}
              </div>
            </div>
          </PermissionHandler>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
