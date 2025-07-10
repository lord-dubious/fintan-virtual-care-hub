import React from "react";
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Stethoscope,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeProvider';
import ProfilePicture from '@/components/ui/ProfilePicture';

const PatientLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const navigationItems = [
    {
      title: 'Dashboard',
      url: '/patient/dashboard',
      icon: Home,
      description: 'Overview and quick stats',
    },
    {
      title: 'My Appointments',
      url: '/patient/appointments',
      icon: Calendar,
      description: 'View and manage appointments',
    },
    {
      title: 'Health Records',
      url: '/patient/records',
      icon: FileText,
      description: 'Medical records and documents',
    },
    {
      title: 'Messages',
      url: '/patient/messages',
      icon: MessageSquare,
      description: 'Secure communication with providers',
    },
    {
      title: 'Settings',
      url: '/patient/settings',
      icon: Settings,
      description: 'Account and privacy settings',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar variant="inset">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">Fintan Care</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActivePath(item.url)}
                    tooltip={item.description}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <ProfilePicture
                          src={user?.profilePicture}
                          name={user?.name || 'Patient'}
                          size="sm"
                        />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {user?.name || 'Patient'}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {user?.email}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <ProfilePicture
                          src={user?.profilePicture}
                          name={user?.name || 'Patient'}
                          size="sm"
                        />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {user?.name || 'Patient'}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {user?.email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/patient/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/patient/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">
                  {navigationItems.find(item => isActivePath(item.url))?.title || 'Patient Portal'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  2
                </span>
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Quick Actions on Desktop */}
              {!isMobile && (
                <div className="flex items-center gap-2 ml-4">
                  <Button asChild size="sm">
                    <Link to="/booking">Book Appointment</Link>
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PatientLayout;
