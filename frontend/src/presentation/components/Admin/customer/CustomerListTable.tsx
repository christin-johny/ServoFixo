import React from 'react';
import { Eye, Edit, ToggleRight, ToggleLeft, User, Phone, Mail } from 'lucide-react';
import type { CustomerDto } from '../../../../domain/types/AdminCustomerDtos';

interface CustomerListTableProps {
  customers: CustomerDto[];
  onEdit: (customer: CustomerDto) => void;
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
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-dashed border-gray-200">
        <User className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No customers found.</p>
      </div>
    );
  }

  // --- MOBILE CARD COMPONENT ---
  const MobileCard = ({ customer }: { customer: CustomerDto }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-3 relative overflow-hidden">
      {/* Left Status Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${customer.suspended ? 'bg-gray-300' : 'bg-green-500'}`} />
      
      <div className="flex justify-between items-start pl-2">
        <div>
          <h3 className={`font-bold text-gray-900 ${customer.suspended ? 'text-gray-500' : ''}`}>
            {customer.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Mail size={12} /> {customer.email}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Phone size={12} /> {customer.phone || 'N/A'}
          </div>
        </div>

        {/* Status Badge */}
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
          customer.suspended 
            ? 'bg-gray-100 text-gray-500 border-gray-200' 
            : 'bg-green-50 text-green-700 border-green-100'
        }`}>
          {customer.suspended ? 'SUSPENDED' : 'ACTIVE'}
        </span>
      </div>

      {/* Action Buttons (Always Visible on Mobile) */}
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-50 pl-2">
        <button 
          onClick={() => onToggleStatus(customer)}
          className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors ${
            customer.suspended ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {customer.suspended ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          {customer.suspended ? 'Activate' : 'Suspend'}
        </button>
        
        <button 
          onClick={() => onEdit(customer)} 
          className="p-2 bg-blue-50 text-blue-600 rounded-lg"
        >
          <Edit size={16} />
        </button>
        
        <button 
          onClick={() => onView(customer)} 
          className="p-2 bg-gray-50 text-gray-600 rounded-lg"
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 📱 MOBILE VIEW: Stacked Cards */}
      <div className="block md:hidden">
        {customers.map((customer) => (
          <MobileCard key={customer.id} customer={customer} />
        ))}
      </div>

      {/* 💻 DESKTOP VIEW: Traditional Table */}
      <div className="hidden md:block overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="group hover:bg-gray-50 transition-colors">
                
                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-400">ID: {customer.id.slice(-4)}</div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-xs text-gray-500">{customer.phone || 'No phone'}</div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                    customer.suspended 
                      ? 'bg-gray-100 text-gray-600' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {customer.suspended ? 'Suspended' : 'Active'}
                  </span>
                </td>

                {/* Actions (Hover Effect) */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => onView(customer)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(customer)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onToggleStatus(customer)}
                      title={customer.suspended ? "Activate" : "Suspend"}
                      className={`p-2 rounded-lg transition-colors ${
                        customer.suspended ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'
                      }`}
                    >
                      {customer.suspended ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CustomerListTable;