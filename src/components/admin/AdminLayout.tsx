import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">
                Painel Administrativo
              </h1>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};