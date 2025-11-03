
import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  CalendarClock, 
  Logs, 
  Link2, 
  LogOut,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Footer from "./Footer";

const DashboardLayout = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You have been logged out successfully.",
    });
    // Navigate to login page
    window.location.href = "/";
  };

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="mr-2" />,
    },
    {
      name: "Manual Topic",
      path: "/manual-topic",
      icon: <FileText className="mr-2" />,
    },
    {
      name: "Scheduler",
      path: "/scheduler",
      icon: <CalendarClock className="mr-2" />,
    },
    {
      name: "Posts",
      path: "/posts",
      icon: <FileText className="mr-2" />,
    },
    {
      name: "Logs",
      path: "/logs",
      icon: <Logs className="mr-2" />,
    },
    {
      name: "Quick Links",
      path: "/links",
      icon: <Link2 className="mr-2" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="mr-2" />,
    },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-svh flex w-full">
        {/* Sidebar */}
        <Sidebar variant="sidebar" className="border-r border-border/30">
          <SidebarHeader className="flex flex-col items-center justify-center p-4">
            <Link to="/dashboard">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
                RelayOne
              </h2>
              <p className="text-xs text-muted-foreground">Intelligence in motion.</p>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.name}
                  >
                    <Link to={item.path} className="flex items-center">
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar */}
          <header className="h-16 flex items-center justify-between px-4 border-b border-border/30 bg-card/40 backdrop-blur-sm">
            <div className="flex items-center">
              <SidebarTrigger className="md:mr-4 mr-2 text-foreground" />
              <h1 className="text-lg font-semibold hidden md:block">RelayOne</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium">U</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="md:hidden"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>

          {/* Footer */}
          <Footer status="operational" />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
