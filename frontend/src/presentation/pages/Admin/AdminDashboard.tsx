// src/presentation/pages/Admin/AdminDashboard.tsx
import React from "react";
import LogoutButton from "../../components/Admin/AdminLogoutButton";

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <LogoutButton redirectTo="/admin/login" />
      </div>

      <div className="mt-6">
        <p>Welcome to the admin area. Add dashboard widgets here.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
