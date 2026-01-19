import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  CreditCard,
  Shield,
  Settings,
  BarChart3,
  HelpCircle,
  LogOut,
  Home
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    end: true
  },
  {
    title: "Usuários",
    url: "/admin/users",
    icon: Users
  },
  {
    title: "Conteúdo",
    url: "/admin/content",  
    icon: FileText
  },
  {
    title: "Notificações",
    url: "/admin/notifications",
    icon: Bell
  },
  {
    title: "Faturamento",
    url: "/admin/billing",
    icon: CreditCard
  }
];

const systemMenuItems = [
  {
    title: "Segurança",
    url: "/admin/security",
    icon: Shield
  },
  {
    title: "Analytics",
    url: "/admin/analytics", 
    icon: BarChart3
  },
  {
    title: "Configurações",
    url: "/admin/settings",
    icon: Settings
  }
];

const supportMenuItems = [
  {
    title: "Ajuda",
    url: "/admin/help",
    icon: HelpCircle
  }
];

interface AdminMobileMenuProps {
  onNavigate?: () => void;
}

export const AdminMobileMenu: React.FC<AdminMobileMenuProps> = ({ onNavigate }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string, exact: boolean = false) => {
    const active = isActive(path, exact);
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? "bg-primary/10 text-primary font-medium" 
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    }`;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate?.();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Painel Admin</h2>
            <p className="text-xs text-muted-foreground">Gerenciamento</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* Voltar ao Site */}
          <NavLink 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            onClick={onNavigate}
          >
            <Home className="h-5 w-5" />
            <span>Voltar ao Site</span>
          </NavLink>

          <Separator className="my-3" />

          {/* Principal */}
          <div className="px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Principal
            </span>
          </div>
          {adminMenuItems.map((item) => (
            <NavLink 
              key={item.title}
              to={item.url} 
              end={item.end}
              className={getNavClasses(item.url, item.end)}
              onClick={onNavigate}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}

          <Separator className="my-3" />

          {/* Sistema */}
          <div className="px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sistema
            </span>
          </div>
          {systemMenuItems.map((item) => (
            <NavLink 
              key={item.title}
              to={item.url}
              className={getNavClasses(item.url)}
              onClick={onNavigate}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}

          <Separator className="my-3" />

          {/* Suporte */}
          <div className="px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Suporte
            </span>
          </div>
          {supportMenuItems.map((item) => (
            <NavLink 
              key={item.title}
              to={item.url}
              className={getNavClasses(item.url)}
              onClick={onNavigate}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </ScrollArea>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </div>
  );
};
