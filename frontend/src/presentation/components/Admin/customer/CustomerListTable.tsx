import React from 'react';
import { Eye, Edit, ToggleRight, ToggleLeft } from 'lucide-react'; // Lucide icons for actions
import type { CustomerDto } from '../../../../domain/types/AdminCustomerDtos';

interface CustomerListTableProps {
  customers: CustomerDto[];
  onEdit: (customer: CustomerDto) => void; 
  // 🚨 FIX: Change type to expect the full CustomerDto object
  onView: (customer: CustomerDto) => void; 
  onToggleStatus: (customer: CustomerDto) => void;
}

const CustomerListTable: React.FC<CustomerListTableProps> = ({
  customers,
  onEdit,
  onView,
  onToggleStatus,
}) => {
  
  if (customers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
        No customers found matching your criteria.
      </div>
    );
  }

  // Helper component for the status indicator (consistent Green/Grey dot)
  const StatusIndicator: React.FC<{ isSuspended: boolean }> = ({ isSuspended }) => (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
        isSuspended 
          ? 'bg-gray-100 text-gray-800' // Grey for Suspended/Inactive
          : 'bg-green-100 text-green-800' // Green for Active
      }`}
    >
      <svg
        className={`-ml-1 mr-1.5 h-2 w-2 ${
          isSuspended ? 'text-gray-400' : 'text-green-400'
        }`}
        fill="currentColor"
        viewBox="0 0 8 8"
      >
        <circle cx={4} cy={4} r={3} />
      </svg>
      {isSuspended ? 'Suspended' : 'Active'}
    </span>
  );

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            
            <tr key={customer.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {customer.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {customer.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {customer.phone || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <StatusIndicator isSuspended={customer.suspended} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                
                {/* 1. View Profile Button (Navigates to Hub) */}
                <button
                  onClick={() => onView(customer)}
                  title="View Profile Hub"
                  className="text-indigo-600 hover:text-indigo-900 p-2 transition duration-150"
                >
                  <Eye className="w-5 h-5" />
                </button>

                {/* 2. Edit Button (Opens Modal) */}
                <button
                  onClick={() => onEdit(customer)}
                  title="Edit Details"
                  className="text-blue-600 hover:text-blue-900 p-2 ml-2 transition duration-150"
                >
                  <Edit className="w-5 h-5" />
                </button>
                
                {/* 3. Status Toggle Button (Industrial Standard - Quick Action) */}
                <button
                  onClick={() => onToggleStatus(customer)}
                  title={customer.suspended ? 'Activate Account' : 'Suspend Account'}
                  className={`p-2 ml-2 transition duration-150 rounded-md ${
                    customer.suspended 
                      ? 'text-green-600 hover:bg-green-100' // If suspended, show green activate button
                      : 'text-red-600 hover:bg-red-100'   // If active, show red suspend button
                  }`}
                >
                  {customer.suspended ? (
                    <ToggleRight className="w-6 h-6" /> // Icon indicating switch ON
                  ) : (
                    <ToggleLeft className="w-6 h-6" />  // Icon indicating switch OFF
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerListTable;