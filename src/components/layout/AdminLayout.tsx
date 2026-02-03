import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import rbuLogo from "@/assets/rbu-logo.png";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { faculty } = useAuth();

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
                    <AvatarImage src={faculty?.profilePhoto} alt={faculty?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {faculty?.name ? getInitials(faculty.name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {faculty?.name || "Admin"}
                  </span>
                </Link>
              </div>
            </div>
          </header>

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
