// frontend/src/presentation/pages/Admin/AdminDashboard.tsx
import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {['Total Bookings', 'Active Technicians', 'Pending Verifications', 'Revenue'].map((title) => (
          <div key={title} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          </div>
        ))}
      </div>

      {/* Content Placeholder */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-64 flex flex-col items-center justify-center text-gray-400">
        <p>Chart Activity Placeholder</p>
        <p className="text-sm">Real data will be implemented in Week 3</p>
      </div>
    </div>
  );
};

export default AdminDashboard;