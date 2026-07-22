
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotificationSystem } from "./components/NotificationSystem";
import Index from "./pages/Index";
import TeamProfilePage from "./pages/TeamProfilePage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const routerBasename = import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "");

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Sonner />
      <NotificationSystem />
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="/team/:teamId" element={
            <ProtectedRoute>
              <TeamProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/player/:playerId" element={
            <ProtectedRoute>
              <PlayerProfilePage />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
