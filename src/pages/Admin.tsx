
import React from "react";
import Navbar from "@/components/Navbar";
import AdminRoute from "@/components/AdminRoute";
import PendingContributionsSection from "@/components/admin/PendingContributionsSection";

const Admin: React.FC = () => {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-app-gray">
        <Navbar />
        <div className="container mx-auto py-8 px-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Painel Administrativo
          </h1>
          <PendingContributionsSection />
        </div>
      </div>
    </AdminRoute>
  );
};

export default Admin;
