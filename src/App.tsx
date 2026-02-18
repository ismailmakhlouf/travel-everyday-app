import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { playNotificationSound } from "@/utils/notificationSound";
import Index from "./pages/Index";
import StudentDemo from "./pages/StudentDemo";
import BusinessDemo from "./pages/BusinessDemo";
import FamilySimulator from "./pages/FamilySimulator";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Play notification on mount to alert about deployment failure
const DeployNotification = () => {
  useEffect(() => {
    playNotificationSound();
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DeployNotification />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/demo/student" element={<StudentDemo />} />
          <Route path="/demo/business" element={<BusinessDemo />} />
          <Route path="/simulator/family" element={<FamilySimulator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
