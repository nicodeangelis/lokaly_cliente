import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import Staff from "./pages/Staff";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Benefits from "./pages/Benefits";
import Locations from "./pages/Locations";
import QRScanner from "./pages/QRScanner";
import QRVisit from "./pages/QRVisit";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/l/:slug" element={<Landing />} />
            <Route path="/app/home" element={<Dashboard />} />
            <Route path="/app/scan" element={<Scan />} />
            <Route path="/app/benefits" element={<Benefits />} />
            <Route path="/app/locations" element={<Locations />} />
            <Route path="/app/qr-scanner" element={<QRScanner />} />
            <Route path="/visit/:token" element={<QRVisit />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
