import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ShoppingCart,
  Heart,
  ChevronDown
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Footer: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const hideFooterPaths = ['/admin', '/login', '/signup', '/signin', '/sign-in'];
  const shouldHideFooter = hideFooterPaths.some(path => location.pathname.startsWith(path));
  
  if (shouldHideFooter) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  const mainLinks = [
    { to: "/comparison", label: "Comparar" },
    { to: "/products", label: "Catálogo" },
    { to: "/contribute", label: "Contribuir" },
    { to: "/economy", label: "Economia" },
  ];

  const toolLinks = [
    { to: "/alerts", label: "Alertas" },
    { to: "/smart-list", label: "Lista" },
    { to: "/gamification", label: "Ranking" },
    { to: "/reports", label: "Relatórios" },
  ];

  const legalLinks = [
    { to: "/terms", label: "Termos" },
    { to: "/privacy", label: "Privacidade" },
    { to: "/plans", label: "Planos" },
    { to: "/api-docs", label: "API" },
  ];

  if (isMobile) {
    return (
      <footer className="mt-auto border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-4 space-y-3">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-foreground">O Esperto Comparador</span>
          </div>

          {/* Collapsible links */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-center gap-1 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
              Ver links <ChevronDown className="w-3 h-3" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pt-2">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {mainLinks.map(link => (
                    <Link key={link.to} to={link.to} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {toolLinks.map(link => (
                    <Link key={link.to} to={link.to} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {legalLinks.map(link => (
                    <Link key={link.to} to={link.to} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Copyright */}
          <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
            © {currentYear} O Esperto · Feito com <Heart className="w-2.5 h-2.5 text-destructive fill-current" /> no Brasil
          </p>
        </div>
      </footer>
    );
  }

  // Desktop: clean 4-column layout without framer-motion
  return (
    <footer className="relative mt-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 dark:from-primary/5 dark:via-accent/5 dark:to-secondary/5" />
      
      <div className="relative border-t border-border/50">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <ShoppingCart className="w-4.5 h-4.5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">O Esperto</h3>
                  <p className="text-xs text-muted-foreground">Comparador</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compare preços e economize nas suas compras do dia a dia.
              </p>
            </div>

            {/* Navigation */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Navegação</h4>
              <ul className="space-y-1.5">
                {mainLinks.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Ferramentas</h4>
              <ul className="space-y-1.5">
                {toolLinks.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Informações</h4>
              <ul className="space-y-1.5">
                {legalLinks.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>© {currentYear} O Esperto Comparador. Todos os direitos reservados.</p>
              <p className="flex items-center gap-1">
                Feito com <Heart className="w-3 h-3 text-destructive fill-current" /> no Brasil
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
