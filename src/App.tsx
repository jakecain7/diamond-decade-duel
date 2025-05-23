
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import GridPage from "./pages/GridPage";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import AuthCallback from "./components/AuthCallback";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import HigherLowerHRGame from "./pages/games/HigherLowerHRGame";
import ComingSoon from "./pages/games/ComingSoon";
import SetDisplayNamePage from "./pages/SetDisplayNamePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdScriptManager from "./components/AdScriptManager";

// Initialize Supabase auth to properly handle hash parameters
// This ensures the client processes the URL fragment on initial load
const processHashParameters = async () => {
  // This will process the access token in the URL fragment if present
  const { error } = await supabase.auth.initialize();
  if (error) {
    console.error("Error initializing auth:", error);
  }
};

const queryClient = new QueryClient();

// Create a component that handles the auth initialization
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    processHashParameters();
  }, []);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthInitializer>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header />
            <AdScriptManager />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/grid/today" element={<GridPage />} />
              <Route path="/games/higher-lower-hr" element={<HigherLowerHRGame />} />
              <Route path="/games/coming-soon/:gameSlug" element={<ComingSoon />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/set-display-name" element={<SetDisplayNamePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AuthInitializer>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
