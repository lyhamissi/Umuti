import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Building2,
  User,
  Menu,
  LogOut,
  Shield
} from "lucide-react";
import { ThemeDropdown } from "./ThemeDropdown";
import { useAuth } from "./AuthProvider";

interface AdminSidebarProps {
  children: React.ReactNode;
}

const AdminSidebar = ({ children }: AdminSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin/dashboard" },
    { icon: FileText, label: "Applications", path: "/admin/applications" },
    { icon: Building2, label: "Pharmacies", path: "/admin/pharmacies" },
    { icon: User, label: "Profile", path: "/admin/profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-72 h-screen bg-card/80 backdrop-blur-xl border-r border-border transform transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full shadow-2xl lg:shadow-none">
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold text-gradient">UMUTI</span>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:translate-x-1"
                  }`}
              >
                {isActive(item.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
                )}
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${!isActive(item.path) && "group-hover:scale-110 group-hover:rotate-6"}`} />
                <span className="font-medium">{item.label}</span>
                {!isActive(item.path) && (
                   <div className="ml-auto opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   </div>
                )}
              </Link>
            ))}
            <ThemeDropdown />

          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-gradient">Admin</span>
          </div>
          <div className="w-10" />
        </header>

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminSidebar;
