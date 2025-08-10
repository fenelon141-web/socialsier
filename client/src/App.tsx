import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, Suspense, lazy, useEffect } from "react";
import { initializeIOSOptimizations } from "@/lib/ios-utils";
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
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

import { useCapacitor } from "./hooks/use-capacitor";

// Lazy load components
const AuthLogin = lazy(() => import("./pages/auth-login"));
const Login = lazy(() => import("./pages/login"));

function Router() {
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
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/auth" component={() => (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-pink-600">Loading...</div>
        </div>}>
          <AuthLogin onAuthSuccess={() => window.location.href = "/"} />
        </Suspense>
      )} />
      <Route path="/login" component={() => (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-pink-600">Loading...</div>
        </div>}>
          <Login />
        </Suspense>
      )} />
      <Route component={Home} />
    </Switch>
  );
}

function App() {
  const { isNative, deviceInfo } = useCapacitor();

  // Initialize iOS optimizations on mount
  useEffect(() => {
    initializeIOSOptimizations();
  }, []);

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
