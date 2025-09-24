import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CustomAuthProvider } from "@/contexts/CustomAuthContext";
import { CustomProtectedRoute } from "@/components/layout/CustomProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChangePassword from "./pages/settings/ChangePassword";
import Dashboard from "./pages/Dashboard";
import CreateAgent from "./pages/CreateAgent";
import ManageApiKeys from "./pages/ManageApiKeys";
import ChatPage from "./pages/chat";
import CallLogsOld from '@/pages/CallLogs';
import AgentsPage from '@/pages/agents';
import NumbersPage from '@/pages/numbers';
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
                  path="/create-agent" 
                  element={
                    <CustomProtectedRoute>
                      <CreateAgent />
                    </CustomProtectedRoute>
                  } 
                />
                <Route 
                  path="/manage-api-keys" 
                  element={
                    <CustomProtectedRoute>
                      <ManageApiKeys />
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
                  path="/call-logs-old" 
                  element={
                    <CustomProtectedRoute>
                      <CallLogsOld />
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
                  path="/agents" 
                  element={
                    <CustomProtectedRoute>
                      <AgentsPage />
                    </CustomProtectedRoute>
                  } 
                />
                <Route 
                  path="/numbers" 
                  element={
                    <CustomProtectedRoute>
                      <NumbersPage />
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
                <Route 
                  path="/settings/password" 
                  element={
                    <CustomProtectedRoute>
                      <ChangePassword />
                    </CustomProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </CustomAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
