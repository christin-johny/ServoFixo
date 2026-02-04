import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/Admin/sidebar/AdminSidebar';
import { Menu } from 'lucide-react';
// ✅ Import Socket Service
import { socketService } from '../../infrastructure/api/socketClient'; 

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // ✅ REAL-TIME CONNECTION LOGIC
  useEffect(() => {
    // 1. Get Admin ID (From LocalStorage or Redux)
    // We use a fixed ID or fetch from storage to ensure uniqueness if needed
    const adminId = localStorage.getItem("adminId") || "ADMIN_MASTER_USER";

    // 2. Connect to Socket as "ADMIN"
    // This triggers the server to join "ADMIN_BROADCAST_CHANNEL"
    socketService.connect(adminId, "ADMIN");

    // 3. Cleanup on Unmount (Logout/Leave)
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">

      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col w-full h-full lg:pl-[260px] transition-all duration-300">
      
      {/* Mobile Header */}
      <header className="flex h-20 items-center border-b bg-white px-8 shadow-sm lg:hidden shrink-0 z-20">
        <button
          onClick={() => setSidebarOpen(true)}
          className="mr-6 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={32} />
        </button>
        <span className="text-2xl font-bold text-gray-800">Admin</span>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10">
        <div className="h-full w-full flex flex-col max-w-[2400px] mx-auto">
          <Outlet />
        </div>
      </main>
      </div>
    </div>
  );
};

export default AdminLayout;