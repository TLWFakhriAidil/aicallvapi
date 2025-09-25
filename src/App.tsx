import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CustomAuthProvider } from "@/contexts/CustomAuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { CustomProtectedRoute } from "@/components/layout/CustomProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/chat";
import CallLogsPage from '@/pages/call-logs';
import PromptsPage from './pages/prompts';
import CampaignsPage from './pages/campaigns';
import BatchCallPage from './pages/batch-call';
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Create QueryClient outside component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CustomAuthProvider>
          <OnboardingProvider>
            <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <CustomProtectedRoute>
                      <Dashboard />
                    </CustomProtectedRoute>
                  } 
                />
                 <Route 
                   path="/chat"
                  element={
                    <CustomProtectedRoute>
                      <ChatPage />
                    </CustomProtectedRoute>
                  } 
                />
                <Route 
                  path="/call-logs" 
                  element={
                    <CustomProtectedRoute>
                      <CallLogsPage />
                    </CustomProtectedRoute>
                  } 
                />
                <Route 
                  path="/prompts" 
                  element={
                    <CustomProtectedRoute>
                      <PromptsPage />
                    </CustomProtectedRoute>
                  } 
                />
                <Route 
                  path="/campaigns" 
                  element={
                    <CustomProtectedRoute>
                      <CampaignsPage />
                    </CustomProtectedRoute>
                  } 
                />
                <Route 
                  path="/batch-call" 
                  element={
                    <CustomProtectedRoute>
                      <BatchCallPage />
                    </CustomProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <CustomProtectedRoute>
                      <Settings />
                    </CustomProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </TooltipProvider>
          </OnboardingProvider>
        </CustomAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
