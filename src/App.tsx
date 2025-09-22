import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import CreateAgent from "./pages/CreateAgent";
import ManageApiKeys from "./pages/ManageApiKeys";
import ApiKeysPage from "./pages/api-keys";
import ChatPage from "./pages/chat";
import CallLogsOld from '@/pages/CallLogs';
import AgentsPage from '@/pages/agents';
import NumbersPage from '@/pages/numbers';
import CallLogsPage from '@/pages/call-logs';
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-agent" 
              element={
                <ProtectedRoute>
                  <CreateAgent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-api-keys" 
              element={
                <ProtectedRoute>
                  <ManageApiKeys />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/api-keys" 
              element={
                <ProtectedRoute>
                  <ApiKeysPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/call-logs-old" 
              element={
                <ProtectedRoute>
                  <CallLogsOld />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/call-logs" 
              element={
                <ProtectedRoute>
                  <CallLogsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agents" 
              element={
                <ProtectedRoute>
                  <AgentsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/numbers" 
              element={
                <ProtectedRoute>
                  <NumbersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
