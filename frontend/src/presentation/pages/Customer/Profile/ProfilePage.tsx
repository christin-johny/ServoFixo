import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, Camera, ChevronRight, Mail, Phone, MapPin, Pencil, Trash2, type LucideIcon } from "lucide-react";

import type { RootState } from "../../../../store/store";
import {
  fetchAddressesStart,
  setAddresses,
  clearCustomerData,
  updateAvatar,
  updateProfileSuccess
} from "../../../../store/customerSlice";
import {
  getMyAddresses,
  deleteAddress,
  setDefaultAddress,
  addAddress,
  updateAddress,
  updateProfile,
  uploadAvatar,
  changePassword
} from "../../../../infrastructure/repositories/customer/customerRepository";
import { logout } from "../../../../store/authSlice";
import { useNotification } from "../../../hooks/useNotification";

import ConfirmModal from "../../../../presentation/components/Admin/Modals/ConfirmModal";
import Navbar from "../../../../presentation/components/Customer/Layout/Navbar";
import BottomNav from "../../../../presentation/components/Customer/Layout/BottomNav";
import Footer from "../../../../presentation/components/Customer/Layout/Footer";
import AddressModal from '../../../../presentation/components/Customer/Profile/AddressModal';
import UpdateDetailsModal from '../../../../presentation/components/Customer/Profile/UpdateDetailsModal';
import ChangePasswordModal from "../../../../presentation/components/Customer/Profile/ChangePasswordModal";

const Pill = ({ text, icon: Icon, }: { text?: string; icon?: LucideIcon; }) => (
  <div className="bg-gray-100 rounded-md px-4 py-2 text-sm text-gray-900 flex items-center gap-2">
    {Icon && <Icon size={14} className="text-gray-500" />}
    <span className="truncate">{text || "-"}</span>
  </div>
);

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { profile, addresses, addressLoading, currentLocationName } = useSelector(
    (state: RootState) => state.customer
  );

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [showDeleteAddressModal, setShowDeleteAddressModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [editingAddress, setEditingAddress] = useState<unknown>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    const loadAddresses = async () => {
      dispatch(fetchAddressesStart());
      try {
        const data = await getMyAddresses();
        dispatch(setAddresses(data));
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };
    loadAddresses();
  }, [dispatch]);


  const handleUpdateProfile = async (formData: { name: string; phone: string }) => {
    try {
      const updatedData = await updateProfile(formData);
      dispatch(updateProfileSuccess(updatedData));
      showSuccess("Profile updated successfully!");
      setIsEditProfileOpen(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update profile";
      showError(errorMessage);
      throw err;
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { avatarUrl } = await uploadAvatar(file);
      dispatch(updateAvatar(avatarUrl));
      showSuccess("Profile picture updated!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message);
        return;
      }

      showError("Failed to upload image");
    }

  };

  const handleChangePassword = async (data: any) => {
    try {
      await changePassword(data);
      showSuccess("Password updated successfully!");
      setIsChangePasswordOpen(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to change password";

      showError(errorMessage);
      throw err;
    }

  };

  const handleAddAddress = async (formData: any) => {
    setIsSaving(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
        showSuccess('Address updated successfully!');
      } else {
        await addAddress(formData);
        showSuccess('Address added successfully!');
      }

      const updated = await getMyAddresses();
      dispatch(setAddresses(updated));
      setIsAddressModalOpen(false);
      setEditingAddress(null);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save address.";
      showError(message);
    }finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      const updated = await getMyAddresses();
      dispatch(setAddresses(updated));
      showSuccess('Default address changed successfully!');
    } catch {
      showError("Failed to set default address");
    }
  };

  const confirmDeleteAddress = (id: string) => {
    setAddressToDelete(id);
    setShowDeleteAddressModal(true);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddress(addressToDelete);
      dispatch(setAddresses(addresses.filter((a) => a.id !== addressToDelete)));
      showSuccess('Address deleted successfully!');
      setShowDeleteAddressModal(false);
      setAddressToDelete(null);
    } catch {
      showError("Failed to delete address");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCustomerData());
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleDeleteAccount = () => {
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F5F7FB] pb-32 relative">

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          className="hidden"
        />

        {/* PROFILE CARD */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="bg-white shadow-sm rounded-xl p-6">
            <div className="grid grid-cols-1">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-black overflow-hidden shadow-inner">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      <User size={56} className="text-gray-400" />
                    )}
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 p-2 bg-black rounded-full text-white shadow-md hover:scale-110 active:scale-90 transition-all"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* USER INFO */}
            <div className="flex flex-col items-center text-center mt-6">
              <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
                <Pill icon={User} text={profile?.name} />
                <Pill icon={Mail} text={profile?.email} />
                <Pill icon={Phone} text={profile?.phone || "N/A"} />
                <Pill icon={MapPin} text={currentLocationName} />
              </div>

              <div className="flex gap-4 mt-5">
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors"
                >
                  Update details
                </button>
                <button onClick={() => setIsChangePasswordOpen(true)} className="text-blue-600 text-sm font-semibold hover:underline">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT (Addresses) */}
        <div className="max-w-5xl mx-auto px-4 mt-8 space-y-10">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Address</h3>
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition-colors"
              >
                Add address
              </button>
            </div>

            {addressLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-44 bg-gray-200 rounded-2xl animate-pulse" />)}
              </div>
            ) : addresses.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {addresses.map(addr => (
                  <div key={addr.id} className="bg-white rounded-2xl shadow-md p-5 relative transition hover:shadow-lg">
                    <span className="inline-block text-xs font-semibold border border-black rounded-full px-3 py-0.5">{addr.tag || "Home"}</span>
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${addr.isDefault ? "border-blue-600 bg-blue-600" : "border-gray-300 hover:border-blue-400"}`}
                        title="Set as default"
                      >
                        {addr.isDefault && <div className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    </div>
                    <div className="mt-4 text-sm font-medium leading-relaxed">
                      <div className="font-bold">{addr.name}</div>
                      <div>{addr.street}</div>
                      <div>{addr.city}</div>
                      <div>PIN: {addr.pincode}</div>
                    </div>
                    <div className="flex justify-end gap-2 mt-5">
                      <button
                        onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => confirmDeleteAddress(addr.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
                <p className="font-medium">No address added.</p>
                <p className="text-sm mt-1">Add your first address to continue.</p>
              </div>
            )}
          </section>

          {/* ACCOUNT ACTIONS */}
          <section className="space-y-3">
            <button onClick={() => setShowLogoutModal(true)} className="w-full bg-white p-4 rounded-xl flex justify-between items-center shadow-sm border hover:bg-gray-50 transition-colors">
              <span className="font-semibold text-gray-700">Logout</span>
              <ChevronRight size={18} />
            </button>
            <button onClick={() => setShowDeleteAccountModal(true)} className="w-full bg-red-50 p-4 rounded-xl flex justify-between items-center hover:bg-red-100 transition-colors">
              <span className="font-semibold text-red-600">Delete My Account</span>
              <ChevronRight size={18} />
            </button>
          </section>
        </div>

        {/* MODALS */}
        <ConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
          title="Logout Confirmation"
          message="Are you sure you want to log out?"
          confirmText="Yes, Logout"
        />

        <ConfirmModal
          isOpen={showDeleteAccountModal}
          onClose={() => setShowDeleteAccountModal(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account?"
          message="Deleting your account will permanently remove all your data."
          confirmText="Confirm Deletion"
        />

        <ConfirmModal
          isOpen={showDeleteAddressModal}
          onClose={() => { setShowDeleteAddressModal(false); setAddressToDelete(null); }}
          onConfirm={handleDeleteAddress}
          title="Delete Address?"
          message="Are you sure you want to delete this address? This action cannot be undone."
          confirmText="Yes, Delete"
        />

        {profile && (
          <UpdateDetailsModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            initialData={{ name: profile.name, phone: profile.phone || '', email: profile.email }}
            onUpdate={handleUpdateProfile}
          />
        )}

        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          onConfirm={handleChangePassword}
        />

        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
          onSubmit={handleAddAddress}
          initialData={editingAddress}
          isLoading={isSaving}
        />

      </div>
      <BottomNav />
      <Footer />
    </>
  );
};

export default ProfilePage;