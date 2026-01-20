import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Menu, 
  Settings, 
  User, 
  Bell, 
  Target, 
  ListChecks, 
  Trophy,
  BarChart3,
  Package,
  PlusCircle,
  TrendingUp,
  CreditCard,
  LogOut,
  ChevronRight,
  ChevronDown,
  Wrench,
  FileText,
  Check
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface MobileNavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ to, icon: Icon, label, onClick }) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
    onClick={onClick}
    aria-label={`Navegar para ${label}`}
  >
    <Icon className="h-5 w-5" aria-hidden="true" />
    <span className="flex-1">{label}</span>
    <ChevronRight className="h-4 w-4 opacity-50" aria-hidden="true" />
  </Link>
);

interface MobileNavGroupProps {
  label: string;
  children: React.ReactNode;
}

const MobileNavGroup: React.FC<MobileNavGroupProps> = ({ label, children }) => (
  <div className="space-y-1">
    <div className="px-4 py-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
    {children}
  </div>
);

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isLoaded } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setIsMenuOpen(false);

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-card shadow-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2" aria-label="Página inicial - O Esperto Comparador">
            <ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8 text-app-secondary" aria-hidden="true" />
            <span className="text-lg sm:text-xl font-bold text-foreground">
              O Esperto Comparador
            </span>
          </Link>

          {/* Desktop Menu - Simplificado */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Links Principais */}
            <Link 
              to="/comparison" 
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-app-secondary transition-colors rounded-md hover:bg-muted/50"
            >
              Comparar
            </Link>
            <Link 
              to="/products" 
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-app-secondary transition-colors rounded-md hover:bg-muted/50"
            >
              Produtos
            </Link>
            <Link 
              to="/contribute" 
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-app-secondary transition-colors rounded-md hover:bg-muted/50"
            >
              Contribuir
            </Link>
            <Link 
              to="/economy" 
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-app-secondary transition-colors rounded-md hover:bg-muted/50"
            >
              Economia
            </Link>

            {/* Dropdown Ferramentas (apenas para logados) */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-app-secondary">
                    <Wrench className="h-4 w-4" />
                    Ferramentas
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border shadow-lg">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Ferramentas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/alerts" className="flex items-center gap-2 cursor-pointer">
                      <Target className="h-4 w-4" />
                      Alertas de Preço
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/smart-list" className="flex items-center gap-2 cursor-pointer">
                      <ListChecks className="h-4 w-4" />
                      Lista Inteligente
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/gamification" className="flex items-center gap-2 cursor-pointer">
                      <Trophy className="h-4 w-4" />
                      Ranking
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reports" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      Relatórios
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Link 
              to="/plans" 
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-app-secondary transition-colors rounded-md hover:bg-muted/50"
            >
              Planos
            </Link>

            <ThemeToggle />

            {/* Área do Usuário */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 ml-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback className="bg-app-secondary text-white text-sm">
                        {getUserInitials(user.email || "")}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border shadow-lg">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Minha Conta</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/profile" 
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        isActiveRoute("/profile") && "text-primary font-medium"
                      )}
                    >
                      <User className="h-4 w-4" />
                      Perfil
                      {isActiveRoute("/profile") && <Check className="h-3 w-3 ml-auto" />}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/notifications" 
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        isActiveRoute("/notifications") && "text-primary font-medium"
                      )}
                    >
                      <Bell className="h-4 w-4" />
                      Notificações
                      {isActiveRoute("/notifications") && <Check className="h-3 w-3 ml-auto" />}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/plans" 
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        isActiveRoute("/plans") && "text-primary font-medium"
                      )}
                    >
                      <CreditCard className="h-4 w-4" />
                      Meu Plano
                      {isActiveRoute("/plans") && <Check className="h-3 w-3 ml-auto" />}
                    </Link>
                  </DropdownMenuItem>
                  {isLoaded && isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-app-secondary">
                          <Settings className="h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm" className="bg-app-primary hover:bg-app-primary/90 text-white ml-2">
                  Entrar
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Abrir menu de navegação">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[300px] sm:w-[320px]">
                <div className="flex flex-col h-full bg-card">
                  {/* Header */}
                  <SheetHeader className="p-4 border-b border-border text-left">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-8 w-8 text-app-secondary" />
                      <div>
                        <SheetTitle className="text-foreground">Menu</SheetTitle>
                        <p className="text-xs text-muted-foreground">Navegação</p>
                      </div>
                    </div>
                  </SheetHeader>

                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-1">
                      {/* Navegação Principal */}
                      <MobileNavGroup label="Navegação">
                        <MobileNavItem to="/comparison" icon={BarChart3} label="Comparar Preços" onClick={closeMenu} />
                        <MobileNavItem to="/products" icon={Package} label="Produtos" onClick={closeMenu} />
                        <MobileNavItem to="/contribute" icon={PlusCircle} label="Contribuir" onClick={closeMenu} />
                      </MobileNavGroup>

                      <Separator className="my-3" />

                      {/* Economia */}
                      <MobileNavGroup label="Economia">
                        <MobileNavItem to="/reports" icon={FileText} label="Relatórios" onClick={closeMenu} />
                        <MobileNavItem to="/economy" icon={TrendingUp} label="Economia" onClick={closeMenu} />
                        <MobileNavItem to="/plans" icon={CreditCard} label="Planos" onClick={closeMenu} />
                      </MobileNavGroup>

                      {/* Ferramentas - Apenas para usuários logados */}
                      {user && (
                        <>
                          <Separator className="my-3" />
                          <MobileNavGroup label="Ferramentas">
                            <MobileNavItem to="/alerts" icon={Target} label="Alertas de Preço" onClick={closeMenu} />
                            <MobileNavItem to="/smart-list" icon={ListChecks} label="Lista Inteligente" onClick={closeMenu} />
                            <MobileNavItem to="/gamification" icon={Trophy} label="Ranking" onClick={closeMenu} />
                          </MobileNavGroup>
                        </>
                      )}

                      {/* Configurações */}
                      {user && (
                        <>
                          <Separator className="my-3" />
                          <MobileNavGroup label="Conta">
                            <MobileNavItem to="/notifications" icon={Bell} label="Notificações" onClick={closeMenu} />
                            {isLoaded && isAdmin && (
                              <MobileNavItem to="/admin" icon={Settings} label="Admin" onClick={closeMenu} />
                            )}
                          </MobileNavGroup>
                        </>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Footer - User Info / Login */}
                  <div className="p-4 border-t border-border">
                    {user ? (
                      <div className="space-y-3">
                        <Link 
                          to="/profile" 
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                          onClick={closeMenu}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                            <AvatarFallback className="bg-app-secondary text-white">
                              {getUserInitials(user.email || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">Meu Perfil</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                        <Button
                          onClick={handleSignOut}
                          variant="outline"
                          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair da Conta
                        </Button>
                      </div>
                    ) : (
                      <Link to="/login" onClick={closeMenu}>
                        <Button className="w-full bg-app-primary hover:bg-app-primary/90 text-white">
                          Entrar na Conta
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
