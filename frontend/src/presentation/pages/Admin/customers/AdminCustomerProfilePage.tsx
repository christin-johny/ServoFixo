import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Loader2, ChevronLeft, Edit2, Trash2, XCircle, Mail, Phone, Calendar, Shield, Clock, CheckCircle } from 'lucide-react';

import { useNotification } from '../../../hooks/useNotification';
import type { CustomerDto } from '../../../../domain/types/AdminCustomerDtos';
import CustomerEditModal from '../../../components/Admin/customer/CustomerEditModal';
import * as customerService from '../../../../infrastructure/repositories/admin/customerService';
import ConfirmModal from '../../../components/Admin/Modals/ConfirmModal';

const TABS = [
    { key: 'profile', icon: User, label: 'Overview' },
    { key: 'orders', icon: ShoppingBag, label: 'Orders' },
    { key: 'addresses', icon: MapPin, label: 'Addresses' },
];

const AdminCustomerProfilePage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const location = useLocation();

    const [customer, setCustomer] = useState<CustomerDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState(TABS[0].key);

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
        const hash = location.hash.substring(1);
        if (hash && TABS.some(tab => tab.key === hash)) {
            setActiveTab(hash);
        }
    }, [fetchCustomer, location.hash]);

    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey);
        navigate({ hash: tabKey }, { replace: true });
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        fetchCustomer();
    }


    const handleConfirmDelete = async () => {
        if (!customer) return;
        setIsDeleting(true);
        try {
            await customerService.deleteCustomer(customer.id);
            showSuccess(`Customer ${customer.name} has been deleted.`);
            setIsDeleteModalOpen(false);
            navigate('/admin/customers');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to save address.";
            showError(message);
        }
        finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-3" />
                <span className="text-sm text-gray-500 font-medium">Loading Profile...</span>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-sm w-full">
                    <div className="bg-red-50 p-3 rounded-full w-fit mx-auto mb-4">
                        <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Profile Not Found</h3>
                    <p className="text-sm text-gray-500 mt-2">{error || "Customer data is unavailable."}</p>
                    <button onClick={() => navigate('/admin/customers')} className="mt-6 w-full flex justify-center items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 font-semibold px-4 py-2.5 rounded-xl transition-colors">
                        <ChevronLeft size={18} /> Back to Customers
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-gray-50/50">

            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
                >
                    <ChevronLeft size={20} /> <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete User"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit User"
                    >
                        <Edit2 size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* 1. Identity Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-50 to-indigo-50 -z-0"></div>

                        <div className="relative z-10 h-24 w-24 rounded-full bg-white p-1.5 shadow-sm border border-gray-100">
                            <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white ${customer.suspended ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        </div>

                        <div className="relative z-10 flex-1 min-w-0 pt-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{customer.name}</h1>
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-2 text-sm text-gray-500">
                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">ID: {customer.id.slice(-6)}</span>
                                <span className="flex items-center gap-1">
                                    {customer.suspended
                                        ? <Shield size={14} className="text-red-500" />
                                        : <Shield size={14} className="text-green-500" />
                                    }
                                    {customer.suspended ? 'Account Suspended' : 'Verified Account'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Tabs & Content Wrapper */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                        {/* Tabs: Hidden Scrollbar here as well */}
                        <div className="border-b border-gray-200 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <div className="flex px-4 sm:px-6 space-x-6">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className={`
                                            flex items-center gap-2 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
                                            ${activeTab === tab.key
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                        `}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Panels */}
                        <div className="p-6">
                            {activeTab === 'profile' && <ProfileDetails customer={customer} />}

                            {activeTab === 'orders' && <OrdersList customerId={customerId || ""} />}
                            {activeTab === 'addresses' && <AddressesList customerId={customerId || ""} />}
                        </div>
                    </div>

                </div>
            </div>

            {/* Modals */}
            <CustomerEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                customerData={customer}
                onUpdateSuccess={handleEditSuccess}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Customer Account"
                message={`Are you sure you want to delete ${customer.name}? This will permanently remove their data.`}
                confirmText="Delete Account"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default AdminCustomerProfilePage;


const ProfileDetails: React.FC<{ customer: CustomerDto }> = ({ customer }) => (
    <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-2 bg-white rounded-lg border border-gray-200 text-blue-600"><Mail size={20} /></div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Email Address</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{customer.email}</p>
                </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-2 bg-white rounded-lg border border-gray-200 text-green-600"><Phone size={20} /></div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Phone Number</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">{customer.phone || 'Not Provided'}</p>
                </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-2 bg-white rounded-lg border border-gray-200 text-purple-600"><Calendar size={20} /></div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Member Since</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                        {new Date(customer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-2 bg-white rounded-lg border border-gray-200 text-orange-600"><Clock size={20} /></div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Last Updated</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                        {new Date(customer.updatedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const OrdersList: React.FC<{ customerId: string }> = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
            <ShoppingBag size={32} className="text-gray-300" />
        </div>
        <h4 className="text-gray-900 font-semibold">No Orders Yet</h4>
        <p className="text-sm text-gray-500 max-w-xs mt-1">This customer hasn't placed any service requests yet.</p>
    </div>
);

const AddressesList: React.FC<{ customerId: string }> = ({ customerId }) => {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await customerService.getCustomerAddresses(customerId);
                setAddresses(data || []);
            } catch (err) {
                setAddresses([]);
                console.error("No addresses found or fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [customerId]);

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (addresses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <MapPin size={32} className="text-gray-300" />
                </div>
                <h4 className="text-gray-900 font-semibold">No Addresses Saved</h4>
                <p className="text-sm text-gray-500 max-w-xs mt-1">
                    There are no saved addresses associated with this account.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {addresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-1">
                    <div className="flex justify-between">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded">
                            {addr.tag}
                        </span>
                        {addr.isDefault && (
                            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                <CheckCircle size={12} /> Primary
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                        {addr.houseNumber}, {addr.street}
                    </p>
                    <p className="text-xs text-gray-500">
                        {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                </div>
            ))}
        </div>
    );
};