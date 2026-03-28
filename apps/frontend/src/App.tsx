import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import HomePage from "./pages/Home";
import UploadPage from "./pages/Upload";
import DashboardPage from "./pages/Dashboard";
import AnalyticsPage from "./pages/Analytics";
import AuditPage from "./pages/Audit";
import PaymentsPage from "./pages/Payments";
import PolicyPage from "./pages/Policy";
import ErrorsPage from "./pages/Errors";
import CfoAiPage from "./pages/CfoAi";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/errors" element={<ErrorsPage />} />
            <Route path="/cfo-ai" element={<CfoAiPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
