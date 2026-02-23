import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../notifications/hooks/useNotification';
import type { CustomerDto, CustomerUpdatePayload } from '../../types/AdminCustomerDtos';
import { updateCustomer } from '../../api/adminCustomerService';
import { Loader2, User, X } from 'lucide-react';
import { CustomerEditSchema, type CustomerEditForm } from '../../../../utils/validation/customerSchemas';
 
interface StyledInputProps extends React.ComponentProps<'input'> {
    label: string;
    error?: string;
}

const StyledInput = ({ label, error, className, ...props }: StyledInputProps) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
            {...props}
            className={`w-full px-3 h-10 border rounded-lg focus:ring-2 outline-none transition-all placeholder:text-gray-400
                ${error 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                } ${className || ''}`
            }
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);
 
interface ButtonProps extends React.ComponentProps<'button'> {
    children: React.ReactNode;
}

const PrimaryButton = ({ children, className, ...props }: ButtonProps) => (
    <button 
        {...props} 
        className={`flex justify-center items-center gap-2 h-10 px-4 rounded-lg text-sm font-bold text-white transition-all shadow-sm bg-blue-600 hover:bg-blue-700 hover:shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed ${className || ''}`}
    >
        {children}
    </button>
);
 
const SecondaryButton = ({ children, className, ...props }: ButtonProps) => (
    <button 
        {...props} 
        type="button"
        className={`px-4 h-10 flex justify-center items-center bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors ${className || ''}`}
    >
        {children}
    </button>
);

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
    const { showSuccess, showError } = useNotification();
    
    const [formData, setFormData] = useState<CustomerEditForm>({
        name: '',
        email: '',
        phone: null,
        suspended: false,
    });
    
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  
    useEffect(() => {
        if (isOpen && customerData) {
            setFormData({
                name: customerData.name,
                email: customerData.email,
                phone: customerData.phone || null,
                suspended: customerData.suspended,
            });
            setValidationErrors({});
        }
    }, [customerData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        setFormData((prev) => ({
            ...prev,
            [name]: name === 'phone' && value === '' ? null : value,
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

        const result = CustomerEditSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: { [key: string]: string } = {};
            result.error.errors.forEach(err => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as string] = err.message;
                }
            });
            setValidationErrors(fieldErrors);
            return;
        }

        setLoading(true);
        try {
            const payload: CustomerUpdatePayload = {
                name: result.data.name,
                email: result.data.email,
                suspended: result.data.suspended,
                phone: result.data.phone || undefined,
            };

            await updateCustomer(customerData.id, payload);

            showSuccess(`Customer ${customerData.name}'s profile updated successfully.`);
            onUpdateSuccess();
            onClose();

        } catch (error: unknown) {
  let serverMessage = "";

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    serverMessage =
      err.response?.data?.message ||
      err.message ||
      "";
  }

  if (
    serverMessage.includes("Email is already registered") ||
    serverMessage.includes("Phone number")
  ) {
    showError(serverMessage);
  } else {
    showError("Failed to save changes. Please try again.");
  }
} finally {
  setLoading(false);
}

    };

    if (!isOpen) return null;

    const hasErrors = Object.keys(validationErrors).length > 0;

    return (
        <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-75 transition-opacity duration-300 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <User className="mr-3 h-6 w-6 text-blue-600" />
                        Edit Customer: {customerData?.name || 'Loading...'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <StyledInput
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={validationErrors.name}
                        required
                    />

                    <StyledInput
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={validationErrors.email}
                        type="email"
                        required
                    />

                    <StyledInput
                        label="Phone Number (Optional)"
                        name="phone"
                        value={formData.phone ?? ''}
                        onChange={handleChange}
                        error={validationErrors.phone}
                        type="tel"
                    />

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="text-sm font-medium text-gray-700">
                            Account Status:
                        </label>
                        <div className="flex items-center space-x-3">
                            <span className={`text-sm font-semibold transition-colors ${formData.suspended ? 'text-red-600' : 'text-green-600'}`}>
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

                    {/* Footer / Submit */}
                    <div className="pt-4 flex justify-end gap-3">
                        <SecondaryButton onClick={onClose}>
                            Cancel
                        </SecondaryButton>
                        
                        <PrimaryButton
                            type="submit"
                            disabled={loading || hasErrors}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Save Changes'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerEditModal;