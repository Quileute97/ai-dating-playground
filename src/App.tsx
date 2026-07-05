
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UserProfilePage from "./pages/UserProfilePage";
import FakeUserProfilePage from "./pages/FakeUserProfilePage";
import ResetPassword from "./pages/ResetPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import PaymentPage from "./pages/PaymentPage";
import PostPage from "./pages/PostPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import GuidePage from "./pages/GuidePage";
import FAQPage from "./pages/FAQPage";

const queryClient = new QueryClient();

// Get base path from environment variable for deployment flexibility
const basename = import.meta.env.VITE_BASE_PATH || '/';

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<Index />} />
          <Route path="/dating" element={<Index />} />
          <Route path="/nearby" element={<Index />} />
          <Route path="/timeline" element={<Index />} />
          <Route path="/messages" element={<Index />} />
          <Route path="/notifications" element={<Index />} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
          <Route path="/u/:userId" element={<FakeUserProfilePage />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/chinh-sach-bao-mat" element={<PrivacyPage />} />
          <Route path="/dieu-khoan" element={<TermsPage />} />
          <Route path="/huong-dan" element={<GuidePage />} />
          <Route path="/faq" element={<FAQPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
