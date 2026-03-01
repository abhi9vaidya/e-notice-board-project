import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Index from "./pages/Index";
import TVDisplay from "./pages/TVDisplay";
import Profile from "./pages/Profile";
import ArchivePage from "./pages/Archive";
import AddEditNoticePage from "./pages/AddEditNoticePage";
import ManageNoticesPage from "./pages/ManageNoticesPage";
import CategoriesPage from "./pages/CategoriesPage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";import AdminPage from './pages/AdminPage';import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tv" element={<TVDisplay />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/add-notice" element={<AddEditNoticePage />} />
              <Route path="/manage-notices" element={<ManageNoticesPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
