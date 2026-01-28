import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider } from "@/hooks/useGameSession";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TerminalPage from "@/pages/Terminal";
import AdminLogin from "@/pages/Admin";
import AdminDashboard from "@/pages/AdminDashboard";
import TheVoid from "@/pages/TheVoid";
import Archive from "@/pages/Archive";
import Debug from "@/pages/Debug";
import PromptBuilder from "@/pages/PromptBuilder";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/terminal" component={TerminalPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/login" component={AdminLogin} />
      <Route path="/void" component={TheVoid} />
      <Route path="/archive" component={Archive} />
      <Route path="/debug" component={Debug} />
      <Route path="/prompt-builder" component={PromptBuilder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <Toaster />
          <Router />
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
