import React, { useState, useEffect } from 'react';
import { useNotification } from '../.././../hooks/useNotification';
import type { CustomerDto, CustomerUpdatePayload } from '../../../../domain/types/AdminCustomerDtos';
import { updateCustomer } from '../../../../infrastructure/repositories/admin/customerService';
import { Loader2, User, X } from 'lucide-react'; 

// ⚠️ ASSUMED COMPONENTS (Adjust these imports based on your real custom components)
// Please replace these lines with your actual custom component imports:
const StyledInput = ({ label, ...props }: any) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);
const PrimaryButton = ({ children, ...props }: any) => (
    <button {...props} className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400">
        {children}
    </button>
);
// ---------------------------------------------------------------------------------


interface CustomerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerData: CustomerDto | null;
  onUpdateSuccess: () => void;
}

const CustomerEditModal: React.FC<CustomerEditModalProps> = ({
  isOpen,
  onClose,
  customerData,
  onUpdateSuccess,
}) => {
  const showNotification = useNotification();
  const [formData, setFormData] = useState<CustomerUpdatePayload>({
    name: '',
    email: '',
    phone: undefined,
    suspended: false,
  });
  const [loading, setLoading] = useState(false);

  // Load customer data when needed
  useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone || '',
        suspended: customerData.suspended,
      });
    }
  }, [customerData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      suspended: !prev.suspended,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData) return;

    setLoading(true);
    try {
      const payload: CustomerUpdatePayload = {
        name: formData.name,
        email: formData.email,
        suspended: formData.suspended,
        phone: formData.phone || undefined, 
      };

      await updateCustomer(customerData.id, payload);

      showNotification('success', `Customer ${customerData.name}'s profile updated successfully.`);
      onUpdateSuccess();
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to update customer profile.';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Structure (Manual Tailwind for generic container) ---
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-75 transition-opacity duration-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="mr-3 h-6 w-6 text-indigo-600" />
            Edit Customer: {customerData?.name || 'Loading...'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body (Form) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <StyledInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <StyledInput
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            required
          />
          
          <StyledInput
            label="Phone Number (Optional)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="tel"
          />

          {/* Account Status Toggle (Consistent with planned UI) */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <label className="text-sm font-medium text-gray-700">
              Account Status:
            </label>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-semibold ${formData.suspended ? 'text-red-600' : 'text-green-600'}`}>
                {formData.suspended ? 'Suspended' : 'Active'}
              </span>
              <button
                type="button"
                onClick={handleStatusToggle}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  formData.suspended ? 'bg-red-500 focus:ring-red-500' : 'bg-green-500 focus:ring-green-500'
                }`}
                role="switch"
                aria-checked={!formData.suspended}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    formData.suspended ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Save Changes'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerEditModal;