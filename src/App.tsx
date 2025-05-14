
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import Index from "./pages/Index";
import HomeScreen from "./components/HomeScreen";
import PlayerManagement from "./components/PlayerManagement";
import MatchSetup from "./components/MatchSetup";
import MatchResult from "./components/MatchResult";
import LeaderboardView from "./components/LeaderboardView";
import PastGamesView from "./components/PastGamesView";
import SessionView from "./pages/SessionView";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/add-players" element={<PlayerManagement />} />
              <Route path="/match-setup" element={<MatchSetup />} />
              <Route path="/match-result" element={<MatchResult />} />
              <Route path="/leaderboard" element={<LeaderboardView />} />
              <Route path="/past-games" element={<PastGamesView />} />
              <Route path="/session/:sessionId" element={<SessionView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GameProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
