import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Grid3X3, 
  Settings, 
  HelpCircle,
  Tv,
  Archive,
  Menu,
  User,
  ShieldCheck,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import rbuLogo from "@/assets/rbu-logo.png";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Add Notice", url: "/add-notice", icon: PlusCircle },
  { title: "Manage Notices", url: "/manage-notices", icon: FileText },
  { title: "Categories", url: "/categories", icon: Grid3X3 },
];

const displayItems = [
  { title: "TV Display", url: "/tv", icon: Tv },
  { title: "Archive", url: "/archive", icon: Archive },
];

const systemItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "About / Help", url: "/about", icon: HelpCircle },
];

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: ShieldCheck },
];

export function AppSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { faculty } = useAuth();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ item }: { item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> } }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          title={collapsed ? item.title : undefined}
          className={cn(
            "flex items-center rounded-lg transition-all duration-200",
            collapsed
              ? "justify-center px-0 py-2.5 w-full"
              : "gap-3 px-3 py-2.5",
            isActive(item.url)
              ? "bg-primary text-primary-foreground font-medium shadow-md"
              : "hover:bg-sidebar-accent text-sidebar-foreground"
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shrink-0 overflow-hidden">
            <img 
              src={rbuLogo} 
              alt="RBU Logo" 
              className="h-9 w-9 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sidebar-foreground text-sm">Ramdeobaba University</span>
              <span className="text-xs text-sidebar-foreground/70">E-Notice Board</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn("py-4", collapsed ? "px-1" : "px-2")}>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider mb-2 px-3">
              Main
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider mb-2 px-3">
              Display
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {displayItems.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider mb-2 px-3">
              System
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {systemItems.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin-only section */}
        {faculty?.role === 'admin' && (
          <SidebarGroup className="mt-6">
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider mb-2 px-3">
                Admin
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminItems.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-sidebar-foreground hover:bg-sidebar-accent w-full justify-center"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
