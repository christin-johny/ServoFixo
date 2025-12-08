import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/Admin/AdminSidebar';
import { Menu } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col h-full lg:ml-[260px] transition-all duration-300">
        
        {/* Mobile Header */}
        <header className="flex h-16 items-center border-b bg-white px-4 shadow-sm lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-4 rounded-md p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-bold text-gray-800">Admin Panel</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;