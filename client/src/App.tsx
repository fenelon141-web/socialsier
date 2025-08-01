import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// Authentication removed for demo
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
// Login pages removed for demo
import NotFound from "@/pages/not-found";

import { useCapacitor } from "./hooks/use-capacitor";

function Router() {
  // No authentication - direct access to all features
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
