import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Loader2, ChevronLeft, Edit2, Trash2 } from 'lucide-react'; // ✅ Added Trash2

import { useNotification } from '../../../hooks/useNotification';
import type { CustomerDto } from '../../../../domain/types/AdminCustomerDtos';
import CustomerEditModal from '../../../components/Admin/customer/CustomerEditModal'; 
import * as customerService from '../../../../infrastructure/repositories/admin/customerService';
// ✅ Import ConfirmModal (Adjust path if necessary based on your folder structure)
import ConfirmModal from '../../../components/Admin/Modals/ConfirmModal'; 

// Define tabs
const TABS = [
    { key: 'profile', icon: User, label: 'Profile Details' },
    { key: 'orders', icon: ShoppingBag, label: 'Orders' },
    { key: 'addresses', icon: MapPin, label: 'Addresses' },
];

const AdminCustomerProfilePage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const location = useLocation();

    // State
    const [customer, setCustomer] = useState<CustomerDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // ✅ NEW STATE: Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Tab State: uses URL hash (e.g., #orders) for persistence
    const [activeTab, setActiveTab] = useState(TABS[0].key);

    // --- Fetch Logic ---
    const fetchCustomer = useCallback(async () => {
        if (!customerId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await customerService.getCustomerById(customerId);
            setCustomer(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? "Failed to load customer profile.");
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchCustomer();

        // Set active tab based on URL hash
        const hash = location.hash.substring(1);
        if (hash && TABS.some(tab => tab.key === hash)) {
            setActiveTab(hash);
        }
    }, [fetchCustomer, location.hash]);

    // Handler to change tab and update URL hash
    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey);
        navigate({ hash: tabKey }, { replace: true });
    };

    // Handler for successful edit modal update
    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        fetchCustomer(); 
    }

    // ✅ NEW HANDLER: Confirm Delete
    const handleConfirmDelete = async () => {
        if (!customer) return;
        setIsDeleting(true);
        try {
            // Call the delete service
            await customerService.deleteCustomer(customer.id);
            
            showSuccess(`Customer ${customer.name} has been deleted.`);
            setIsDeleteModalOpen(false);
            
            // 🚀 Redirect back to the main list because this profile is now gone
            navigate('/admin/customers'); 
        } catch (error: any) {
            showError("Failed to delete customer. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };


    // --- Render States ---
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[300px]">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
                <span className="ml-3 text-gray-600">Loading Customer Profile...</span>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-10 text-red-600 bg-red-50 rounded-xl">
                <XCircle className="h-8 w-8 mb-3" />
                <p className="text-lg font-semibold">Error Loading Profile</p>
                <p className="text-sm text-red-500 mt-1">{error || "Customer not found."}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                    <ChevronLeft size={16} className="mr-1" /> Back to List
                </button>
            </div>
        );
    }


    // --- Main Render ---
    return (
        <div className="flex flex-col gap-6 p-4">

            {/* Header and Actions */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <User className="text-indigo-600 h-7 w-7" />
                            {customer.name}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Customer ID: {customer.id}</p>
                    </div>
                    <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border 
              ${customer.suspended
                                ? 'bg-red-100 text-red-700 border-red-300'
                                : 'bg-green-100 text-green-700 border-green-300'}`}
                    >
                        {customer.suspended ? 'Suspended' : 'Active'}
                    </span>
                </div>

                <div className="flex gap-3">
                    {/* ✅ DELETE BUTTON */}
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all text-sm font-semibold shadow-sm"
                    >
                        <Trash2 size={16} /> Delete
                    </button>

                    {/* EDIT BUTTON */}
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition-all text-sm font-semibold"
                    >
                        <Edit2 size={16} /> Edit Profile
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <nav className="flex space-x-2 border-b border-gray-200">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
              ${activeTab === tab.key
                                ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }
            `}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Tabs Content Area */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                {/* Render content based on activeTab */}
                {activeTab === 'profile' && <ProfileDetails customer={customer} />}
                {activeTab === 'orders' && <OrdersList customerId={customerId} />}
                {activeTab === 'addresses' && <AddressesList customerId={customerId} />}
            </div>

            {/* Edit Modal */}
            <CustomerEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                customerData={customer} 
                onUpdateSuccess={handleEditSuccess}
            />

            {/* ✅ DELETE CONFIRM MODAL */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Customer Account"
                message={`Are you sure you want to delete ${customer?.name}? This action effectively removes them from the system.`}
                confirmText="Delete Account"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default AdminCustomerProfilePage;


// --- Stubbed Sub-Components ---

const ProfileDetails: React.FC<{ customer: CustomerDto }> = ({ customer }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Basic Information</h3>
        <p className="text-sm">Name: <span className="font-semibold text-gray-900">{customer.name}</span></p>
        <p className="text-sm">Email: <span className="font-semibold text-gray-900">{customer.email}</span></p>
        <p className="text-sm">Phone: <span className="font-semibold text-gray-900">{customer.phone || 'N/A'}</span></p>
        <p className="text-sm">Member Since: <span className="font-semibold text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</span></p>
    </div>
);

const OrdersList: React.FC<{ customerId: string }> = ({ customerId }) => (
    <div className="text-gray-500">No orders yet</div>
);

const AddressesList: React.FC<{ customerId: string }> = ({ customerId }) => (
    <div className="text-gray-500">no address yet</div>
);