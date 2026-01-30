import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider } from "@/hooks/useGameSession";
import { ReportProvider } from "@/hooks/useReportContext";
import DevModePanel from "@/components/DevModePanel";
import QuickNav from "@/components/QuickNav";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TerminalPage from "@/pages/Terminal";
import AdminLogin from "@/pages/Admin";
import AdminDashboard from "@/pages/AdminDashboard";
import TheVoid from "@/pages/TheVoid";
import Archive from "@/pages/Archive";
import Debug from "@/pages/Debug";
import PromptBuilder from "@/pages/PromptBuilder";
import ReportBuilder from "@/pages/ReportBuilder";
import Wiki from "@/pages/Wiki";
import AILab from "@/pages/AILab";
import InvestigationWorkspace from "@/pages/InvestigationWorkspace";

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
      <Route path="/ai-lab" component={AILab} />
      <Route path="/investigate" component={InvestigationWorkspace} />
      <Route path="/report" component={ReportBuilder} />
      <Route path="/wiki" component={Wiki} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <ReportProvider>
            <Toaster />
            <Router />
            <DevModePanel />
            <QuickNav />
          </ReportProvider>
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
