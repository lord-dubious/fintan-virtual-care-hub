
import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock authentication for demo purposes
// In a real app, this would be handled with a proper auth system
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("admin-authenticated") === "true";
  });

  const login = () => {
    localStorage.setItem("admin-authenticated", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("admin-authenticated");
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
};

const NavItem = ({ 
  to, 
  label, 
  icon: Icon, 
  active, 
  onClick 
}: { 
  to: string; 
  label: string; 
  icon: React.ElementType; 
  active: boolean;
  onClick?: () => void;
}) => {
  return (
    <a 
      href={to}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        window.location.href = to;
      }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-md transition-colors
        ${active 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted"
        }
      `}
    >
      <Icon size={20} />
      <span>{label}</span>
    </a>
  );
};

const AdminLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/appointments", label: "Appointments", icon: Calendar },
    { to: "/admin/patients", label: "Patients", icon: Users },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const renderNavItems = (onClick?: () => void) => (
    <>
      {navItems.map((item) => (
        <NavItem 
          key={item.to} 
          to={item.to} 
          label={item.label} 
          icon={item.icon} 
          active={location.pathname === item.to}
          onClick={onClick}
        />
      ))}
      <NavItem 
        to="#" 
        label="Logout" 
        icon={LogOut} 
        active={false}
        onClick={() => {
          if (onClick) onClick();
          handleLogout();
        }}
      />
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {isMobile ? (
        <>
          <header className="sticky top-0 z-10 border-b bg-background p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Admin Portal</h1>
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center py-4">
                    <h2 className="text-lg font-semibold">Admin Menu</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                      <X size={18} />
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-1 mt-4">
                    {renderNavItems(() => setIsSidebarOpen(false))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </header>
          <main className="flex-grow p-4">
            <Outlet />
          </main>
        </>
      ) : (
        <div className="flex h-screen overflow-hidden">
          <aside className="w-64 border-r bg-card p-4 flex flex-col">
            <div className="mb-6">
              <h1 className="text-xl font-bold">Admin Portal</h1>
            </div>
            <nav className="flex flex-col gap-1 flex-grow">
              {renderNavItems()}
            </nav>
          </aside>
          <main className="flex-grow p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
