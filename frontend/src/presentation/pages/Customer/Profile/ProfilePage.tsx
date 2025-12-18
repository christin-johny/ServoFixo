import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  User,  Trash2, 
 Camera, ChevronRight, 
} from 'lucide-react';

import type { RootState } from '../../../../store/store';
import { 
  fetchAddressesStart, 
  setAddresses, 
  clearCustomerData 
} from '../../../../store/customerSlice';
import { 
  getMyAddresses, 
  deleteAddress, 
  setDefaultAddress 
} from '../../../../infrastructure/repositories/customer/customerRepository';
import { logout } from '../../../../store/authSlice';
import ConfirmModal from '../../../../presentation/components/Admin/Modals/ConfirmModal';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { profile, addresses, addressLoading } = useSelector((state: RootState) => state.customer);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadAddresses = async () => {
      dispatch(fetchAddressesStart());
      try {
        const data = await getMyAddresses();
        dispatch(setAddresses(data));
      } catch (err) {
        console.error("Failed to load address book", err);
      }
    };
    loadAddresses();
  }, [dispatch]);

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      const updated = await getMyAddresses(); 
      dispatch(setAddresses(updated));
    } catch  {
      alert("Failed to update default address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id);
      dispatch(setAddresses(addresses.filter(a => a.id !== id)));
    } catch {
      alert("Could not remove address");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCustomerData());
    localStorage.removeItem("accessToken");
    navigate('/login');
  };

return (
  <div className="min-h-screen bg-[#F5F7FB] pb-28">
    {/* ===== HEADER / PROFILE ===== */}
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center">

          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-full h-full object-cover" />
              ) : (
                <User size={44} className="text-gray-400" />
              )}
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-blue-600 rounded-full text-white shadow active:scale-95">
              <Camera size={16} />
            </button>
          </div>

          <h2 className="mt-4 text-xl font-bold">{profile?.name}</h2>

          {/* Info Pills */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
            <div className="bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-600">
              {profile?.email}
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-600">
              {profile?.phone || "No phone number"}
            </div>
          </div>

          <button
            onClick={() => navigate("/profile/edit")}
            className="mt-5 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow"
          >
            Update Details
          </button>
        </div>
      </div>
    </div>

    {/* ===== CONTENT ===== */}
    <div className="max-w-5xl mx-auto px-4 mt-8 space-y-10">

      {/* ===== ADDRESSES ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Address</h3>
          <button
            onClick={() => navigate("/profile/add-address")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Add address
          </button>
        </div>

        {addressLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : addresses.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map(addr => (
              <div
                key={addr.id}
                className={`relative bg-white p-4 rounded-xl border shadow-sm transition 
                ${addr.isDefault ? "ring-2 ring-blue-500" : ""}`}
              >
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded">
                  {addr.tag}
                </span>

                <p className="mt-6 text-sm text-gray-700 leading-relaxed">
                  {addr.street}, {addr.city}, {addr.pincode}
                </p>

                <div className="flex justify-between items-center mt-4">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-blue-600 font-bold"
                    >
                      Set Default
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-xl text-center text-gray-400">
            No addresses added yet
          </div>
        )}
      </section>

      {/* ===== ACCOUNT ACTIONS ===== */}
      <section className="space-y-3">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full bg-white p-4 rounded-xl flex justify-between items-center shadow-sm"
        >
          <span className="font-semibold text-gray-700">Logout</span>
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full bg-red-50 p-4 rounded-xl flex justify-between items-center"
        >
          <span className="font-semibold text-red-600">Delete My Account</span>
          <ChevronRight size={18} />
        </button>
      </section>
    </div>

    {/* ===== MODALS ===== */}
    <ConfirmModal
      isOpen={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      onConfirm={handleLogout}
      title="Logout Confirmation"
      message="Are you sure you want to log out?"
      confirmText="Yes, Logout"
    />

    <ConfirmModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={() => {}}
      title="Delete Account?"
      message="This action cannot be undone."
      confirmText="Confirm Deletion"
    />
  </div>
);

};

export default ProfilePage;