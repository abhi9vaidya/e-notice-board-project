import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, KeyRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import rbuLogo from "@/assets/rbu-logo.png";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { faculty, hasPasswordProvider } = useAuth();

  const [pwdBannerOpen, setPwdBannerOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const uid = faculty?.id;
    return uid ? localStorage.getItem(`rbu-admin-pwd-notice-${uid}`) !== 'dismissed' : false;
  });
  const showPwdBanner = faculty?.role === 'admin' && !hasPasswordProvider && pwdBannerOpen;

  const dismissBanner = () => {
    if (faculty?.id) localStorage.setItem(`rbu-admin-pwd-notice-${faculty.id}`, 'dismissed');
    setPwdBannerOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-40 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-full items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />

                {/* RBU Logo - Small in header */}
                <Link to="/" className="hidden md:flex items-center gap-3">
                  <img
                    src={rbuLogo}
                    alt="RBU Logo"
                    className="h-10 w-10 object-contain"
                  />
                </Link>

                {title && (
                  <div className="border-l border-border pl-4 hidden md:block">
                    <h1 className="text-lg font-bold text-foreground">{title}</h1>
                    {subtitle && (
                      <p className="text-xs text-muted-foreground">{subtitle}</p>
                    )}
                  </div>
                )}

                {/* Mobile title */}
                {title && (
                  <div className="md:hidden">
                    <h1 className="text-lg font-bold text-foreground">{title}</h1>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                </div>

                <ThemeToggle />

                <Link to="/profile" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src={faculty?.profilePhotoUrl || rbuLogo} alt={faculty?.name} />
                    <AvatarFallback className="bg-white p-1">
                      <img src={rbuLogo} alt="RBU" className="h-full w-full object-contain" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {faculty?.name || "Admin"}
                  </span>
                </Link>
              </div>
            </div>
          </header>

          {/* First-time admin password banner */}
          {showPwdBanner && (
            <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-sm">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-foreground">
                  <span className="font-semibold">Secure your admin account</span> — set a password so you can also sign in with your email.{' '}
                  <Link to="/profile" className="text-primary underline underline-offset-2 hover:no-underline">Set password →</Link>
                </span>
              </div>
              <button onClick={dismissBanner} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
