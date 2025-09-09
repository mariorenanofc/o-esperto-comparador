import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export const AdminBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const getBreadcrumbName = (segment: string, index: number) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(segment);
    
    if (isUUID) {
      return "Detalhes do Usuário";
    }
    
    const nameMap: Record<string, string> = {
      admin: "Administração",
      dashboard: "Dashboard",
      users: "Usuários",
      content: "Conteúdo",
      notifications: "Notificações",
      billing: "Faturamento",
      security: "Segurança",
      settings: "Configurações",
      analytics: "Analytics",
    };
    
    return nameMap[segment] || segment;
  };

  const buildPath = (index: number) => {
    return "/" + pathSegments.slice(0, index + 1).join("/");
  };

  if (pathSegments.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link 
        to="/admin/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {pathSegments.slice(1).map((segment, index) => {
        const isLast = index === pathSegments.length - 2;
        const path = buildPath(index + 1);
        
        return (
          <React.Fragment key={segment}>
            <ChevronRight className="w-4 h-4" />
            {isLast ? (
              <span className="text-foreground font-medium">
                {getBreadcrumbName(segment, index)}
              </span>
            ) : (
              <Link 
                to={path}
                className="hover:text-foreground transition-colors"
              >
                {getBreadcrumbName(segment, index)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};