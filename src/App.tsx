import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import AuthPage from "@/pages/AuthPage";
import AutomationPage from "@/pages/AutomationPage";
import ConnectorsPage from "@/pages/ConnectorsPage";
import SheetPage from "@/pages/SheetPage";
import GalleryPage from "@/pages/GalleryPage";
import SettingsPage from "@/pages/SettingsPage";
import DashboardPage from "@/pages/team/DashboardPage";
import WeeklyUpdatePage from "@/pages/team/WeeklyUpdatePage";
import LeadsPage from "@/pages/team/LeadsPage";
import MarketingPage from "@/pages/team/MarketingPage";
import RedditPage from "@/pages/team/RedditPage";
import CalendarPage from "@/pages/team/CalendarPage";
import NotesPage from "@/pages/team/NotesPage";
import IdeasPage from "@/pages/team/IdeasPage";
import WhatsAppPage from "@/pages/team/WhatsAppPage";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

// Top-level routing + auth gate
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/team" replace />} />
              <Route path="/automation" element={<AutomationPage />} />
              <Route path="/connectors" element={<ConnectorsPage />} />
              <Route path="/sheet" element={<SheetPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/team" element={<DashboardPage />} />
              <Route path="/weekly-update" element={<WeeklyUpdatePage />} />
              <Route path="/marketing" element={<MarketingPage />} />
              <Route path="/reddit" element={<RedditPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/ideas" element={<IdeasPage />} />
              <Route path="/whatsapp" element={<WhatsAppPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Redirects unauthenticated users to /auth
function RequireAuth() {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex h-full items-center justify-center text-ledger/60">Loading…</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return <Outlet />;
}
