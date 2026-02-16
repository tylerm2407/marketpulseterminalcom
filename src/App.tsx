import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Header } from "@/components/layout/Header";
import Index from "./pages/Index";
import StockDossier from "./pages/StockDossier";
import Watchlist from "./pages/Watchlist";
import News from "./pages/News";
import EarningsCalendar from "./pages/EarningsCalendar";
import StockComparison from "./pages/StockComparison";
import StockScreener from "./pages/StockScreener";
import NotFound from "./pages/NotFound";
import { OnboardingTour } from "@/components/OnboardingTour";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/stock/:ticker" element={<StockDossier />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/news" element={<News />} />
          <Route path="/earnings" element={<EarningsCalendar />} />
          <Route path="/compare" element={<StockComparison />} />
          <Route path="/screener" element={<StockScreener />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MobileBottomNav />
        <OnboardingTour />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
