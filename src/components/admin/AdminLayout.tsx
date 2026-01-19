import React from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileMenu } from "./AdminMobileMenu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        {!isMobile && <AdminSidebar />}
        
        <main className="flex-1 flex flex-col w-full">
          {/* Header - Mobile First */}
          <header className="sticky top-0 z-40 h-14 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex items-center px-3 sm:px-4 gap-2 sm:gap-4">
            {isMobile ? (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px]">
                  <AdminMobileMenu onNavigate={() => setMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            ) : (
              <SidebarTrigger className="h-8 w-8" />
            )}
            
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                Painel Admin
              </h1>
            </div>
          </header>

          {/* Content - Mobile Optimized Padding */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};