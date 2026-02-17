import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import QuickNav from "@/components/QuickNav";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
/* MODULE_IMPORTS */

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* MODULE_ROUTES */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <QuickNav />
        {/* MODULE_PROVIDERS */}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
