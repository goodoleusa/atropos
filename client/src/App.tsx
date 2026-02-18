import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider } from "@/hooks/useGameSession";
import { ReportProvider } from "@/hooks/useReportContext";
import { GlobalEffectsProvider } from "@/hooks/useGlobalEffects";
import { AgentChatProvider } from "@/hooks/useAgentChat";
import GlobalEffectsOverlay from "@/components/GlobalEffectsOverlay";
import QuickNav from "@/components/QuickNav";
import { AchievementManager } from "@/components/AchievementManager";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TerminalPage from "@/pages/Terminal";
import AdminLogin from "@/pages/Admin";
import AdminDashboard from "@/pages/AdminDashboard";
import Recs from "@/pages/Recs";
import AILab from "@/pages/AILab";
import TheVoid from "@/pages/TheVoid";
import Archive from "@/pages/Archive";
import Debug from "@/pages/Debug";
import InvestigationWorkspace from "@/pages/InvestigationWorkspace";
import VideoGallery from "@/pages/VideoGallery";
import Agents from "@/pages/Agents";
import CrewBuilder from "@/pages/CrewBuilder";
import CampaignsHub from "@/pages/CampaignsHub";
import CampaignPlayer from "@/pages/CampaignPlayer";
import CampaignBuilder from "@/pages/builder/CampaignBuilder";
import Profile from "@/pages/Profile";
import Leaderboards from "@/pages/Leaderboards";
import BusinessDashboard from "@/pages/BusinessDashboard";
import InvestorDashboard from "@/pages/InvestorDashboard";
import MissionLanding from "@/pages/MissionLanding";
import ScannerDashboard from "@/pages/ScannerDashboard";
import PortfolioShare from "@/pages/PortfolioShare";
import Wiki from "@/pages/Wiki";
import Walkthrough from "@/pages/Walkthrough";
import BehaviorAnalysis from "@/pages/BehaviorAnalysis";
import MarketingDashboard from "@/pages/MarketingDashboard";
import FontCustomizer from "@/components/FontCustomizer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mission" component={MissionLanding} />
      <Route path="/terminal" component={TerminalPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/portfolio/:shareId" component={PortfolioShare} />
      <Route path="/leaderboards" component={Leaderboards} />
      <Route path="/business" component={BusinessDashboard} />
      <Route path="/investors" component={InvestorDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/login" component={AdminLogin} />
      <Route path="/void" component={TheVoid} />
      <Route path="/archive" component={Archive} />
      <Route path="/recs" component={Recs} />
      <Route path="/debug" component={Debug} />
      <Route path="/prompt-builder">{() => { window.location.replace('/admin'); return null; }}</Route>
      <Route path="/ai-lab">{() => { window.location.replace('/investigate?tab=ai-lab'); return null; }}</Route>
      <Route path="/investigate" component={InvestigationWorkspace} />
      <Route path="/agents" component={Agents} />
      <Route path="/agent" component={Agents} />
      <Route path="/crew-builder" component={CrewBuilder} />
      <Route path="/builder" component={CampaignBuilder} />
      <Route path="/campaigns" component={CampaignsHub} />
      <Route path="/play/:campaignId" component={CampaignPlayer} />
      <Route path="/scanner" component={ScannerDashboard} />
      <Route path="/wiki" component={Wiki} />
      <Route path="/walkthrough" component={Walkthrough} />
      <Route path="/behavior" component={BehaviorAnalysis} />
      <Route path="/videos" component={VideoGallery} />
      <Route path="/marketing" component={MarketingDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { QRCodeModal } from "@/components/QRCodeModal";
import { useState, useEffect } from "react";

function App() {
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenQR = () => setQrModalOpen(true);
    window.addEventListener('open-qr-modal', handleOpenQR);
    return () => window.removeEventListener('open-qr-modal', handleOpenQR);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <ReportProvider>
            <AgentChatProvider>
              <GlobalEffectsProvider>
                <Toaster />
                <Router />
                <QuickNav />
                <GlobalEffectsOverlay />
                <AchievementManager />
                <FontCustomizer />
                <QRCodeModal open={qrModalOpen} onOpenChange={setQrModalOpen} />
              </GlobalEffectsProvider>
            </AgentChatProvider>
          </ReportProvider>
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
