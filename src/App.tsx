import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { NativeAppShell } from "@/native/NativeAppShell";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { ScrollAnimator } from "@/components/effects/ScrollAnimator";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { KeyboardShortcutsProvider } from "@/components/KeyboardShortcutsProvider";
import Index from "./pages/Index";
import StockDossier from "./pages/StockDossier";
import Watchlist from "./pages/Watchlist";
import News from "./pages/News";
import EarningsCalendar from "./pages/EarningsCalendar";
import StockComparison from "./pages/StockComparison";
import StockScreener from "./pages/StockScreener";
import Portfolio from "./pages/Portfolio";
import PriceAlerts from "./pages/PriceAlerts";
import Analytics from "./pages/Analytics";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { NovaWealthAuthHandler } from "@/components/NovaWealthAuthHandler";
import { RequireAuth } from "@/components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <CustomCursor />
          <ScrollAnimator />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NativeAppShell>
              <NovaWealthAuthHandler />
              <KeyboardShortcutsProvider />
              <KeyboardShortcutsDialog />
              <Routes>
                {/* Public routes — no chrome */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* Protected routes — wrapped with RequireAuth + app chrome */}
                <Route
                  path="*"
                  element={
                    <RequireAuth>
                      <Header />
                      <div className="pt-14"> {/* Offset for fixed header */}
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/stock/:ticker" element={<StockDossier />} />
                          <Route path="/watchlist" element={<Watchlist />} />
                          <Route path="/news" element={<News />} />
                          <Route path="/earnings" element={<EarningsCalendar />} />
                          <Route path="/compare" element={<StockComparison />} />
                          <Route path="/screener" element={<StockScreener />} />
                          <Route path="/portfolio" element={<Portfolio />} />
                          <Route path="/alerts" element={<PriceAlerts />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/pricing" element={<Pricing />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                      <MobileBottomNav />
                      <OnboardingChecklist />
                    </RequireAuth>
                  }
                />
              </Routes>
            </NativeAppShell>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
