import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useNoticeExpiryArchiver } from "@/hooks/useNoticeExpiryArchiver";
import Index from "./pages/Index";
import TVDisplay from "./pages/TVDisplay";
import Profile from "./pages/Profile";
import ArchivePage from "./pages/Archive";
import AddEditNoticePage from "./pages/AddEditNoticePage";
import ManageNoticesPage from "./pages/ManageNoticesPage";
import CategoriesPage from "./pages/CategoriesPage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLoader = () => (
  <div className="min-h-screen flex items-center justify-center text-muted-foreground">
    Loading...
  </div>
);

const ProtectedRoute = ({ children, roles }: { children: ReactElement; roles?: Array<"faculty" | "admin"> }) => {
  const { loading, isAuthenticated, faculty } = useAuth();
  const location = useLocation();

  if (loading) return <AppLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  if (roles && (!faculty || !roles.includes(faculty.role))) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => {
  useNoticeExpiryArchiver();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tv" element={<TVDisplay />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
        <Route path="/add-notice" element={<ProtectedRoute><AddEditNoticePage /></ProtectedRoute>} />
        <Route path="/manage-notices" element={<ProtectedRoute><ManageNoticesPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
