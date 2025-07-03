import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import MapView from "@/pages/map";
import Social from "@/pages/social";
import Badges from "@/pages/badges";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import { useCapacitor } from "./hooks/use-capacitor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/map" component={MapView} />
      <Route path="/social" component={Social} />
      <Route path="/badges" component={Badges} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isNative, deviceInfo } = useCapacitor();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
