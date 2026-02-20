import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Clock, Info, ChevronRight, Plus, MapPin } from 'lucide-react';

// Store & Repos
import type { RootState } from '../../../../store/store';
import { fetchAddressesStart, setAddresses } from '../../../../store/customerSlice';
import { getMyAddresses,addAddress  } from '../../../profile/api/customerRepository';
import { createBooking } from '../../api/customerBookingRepository';
import { useNotification } from '../../../notifications/hooks/useNotification';

// Components
import Navbar from '../../../../layouts/customer/Navbar';
import AddressModal from '../../../profile/components/customer/AddressModal';

// Define expected state from navigation
interface LocationState {
    serviceId: string;
    serviceName: string;
    basePrice: number;
}

const BookingConfirm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showError, showSuccess } = useNotification();

  // 1. Get Data Passed from ServiceDetails safely
  const state = location.state as LocationState | null;
  const { serviceId, serviceName, basePrice } = state || {};

  // 2. Redux State
  const { addresses, addressLoading } = useSelector((state: RootState) => state.customer);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");
  const [isBookLoading, setIsBookLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // 3. Load Addresses on Mount
  useEffect(() => {
    if (!serviceId) {
      navigate('/services'); 
      return;
    }
    const loadData = async () => {
        dispatch(fetchAddressesStart());
        try {
            const data = await getMyAddresses();
            dispatch(setAddresses(data));
            // Auto-select default address
            const defaultAddr = data.find(a => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        } catch (err) {
            console.error("Failed to load addresses", err);
        }
    };
    loadData();
  }, [dispatch, serviceId, navigate]);

 
  const handleConfirmBooking = async () => {
    // 1. Basic Checks
    if (!selectedAddressId) {
      showError("Please select an address");
      return;
    }
    if (!user?.id) {
        showError("User not authenticated");
        return;
    }

    const addressObj = addresses.find(a => a.id === selectedAddressId);
    if (!addressObj) return;

    // 2. Validate Coordinates
    if (!addressObj.location?.lat || !addressObj.location?.lng) {
        showError("This address is missing GPS coordinates. Please add a new one with a pin.");
        return;
    }

    // 3. Validate Phone (CRITICAL FIX)
    // We check this BEFORE calling the backend
    if (!addressObj.phone || addressObj.phone.trim().length < 10) {
        showError("The selected address must have a valid phone number.");
        return;
    }

    setIsBookLoading(true);
    try {
      const response = await createBooking({
        serviceId: serviceId!,
        customerId: user.id,
 
        contact: {
            name: addressObj.name,
            phone: addressObj.phone 
        }, 

        location: {
            address: `${addressObj.houseNumber}, ${addressObj.street}, ${addressObj.city}`,
            coordinates: {
                lat: addressObj.location.lat,
                lng: addressObj.location.lng
            }
        },
        requestedTime: new Date().toISOString(),
        meta: {
            instructions
        }
      });

      showSuccess("Searching for technicians...");
      
      navigate('/booking/searching', { 
        state: { bookingId: response.id } 
      });

    } catch (err: unknown) { 
      let msg = "Booking failed";
      if (err instanceof Error) msg = err.message;
      showError(msg);
    } finally {
      setIsBookLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">Review & Book</h1>

        {/* SERVICE SUMMARY */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
            <div>
                <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Service</p>
                <h3 className="font-bold text-lg text-gray-900">{serviceName}</h3>
            </div>
            <div className="text-right">
                <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Est. Price</p>
                <p className="font-bold text-lg text-gray-900">₹{basePrice}</p>
            </div>
        </div>

        {/* ADDRESS SELECTOR */}
        <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">Select Location</h3>
                <button 
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                    <Plus size={16} /> Add New
                </button>
            </div>
            
            <div className="space-y-3">
                {addressLoading ? <p className="text-gray-400 text-sm">Loading addresses...</p> : addresses.map(addr => (
                    <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                            selectedAddressId === addr.id 
                            ? 'border-blue-600 bg-blue-50/50' 
                            : 'border-transparent bg-white shadow-sm hover:border-gray-200'
                        }`}
                    >
                        <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                             selectedAddressId === addr.id ? 'border-blue-600' : 'border-gray-300'
                        }`}>
                            {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{addr.tag}</span>
                                {addr.isDefault && <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">Default</span>}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {addr.houseNumber}, {addr.street}, {addr.city}
                            </p>
                            {!addr.location?.lat && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <MapPin size={12}/> Missing Pin Location
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                
                {!addressLoading && addresses.length === 0 && (
                    <div className="text-center p-8 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No addresses found.</p>
                        <button onClick={() => setIsAddressModalOpen(true)} className="text-blue-600 font-bold mt-2">Add your first address</button>
                    </div>
                )}
            </div>
        </div>

        {/* TIME SLOT */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
            <div className="bg-green-100 p-2.5 rounded-full text-green-700">
                <Clock size={20} />
            </div>
            <div>
                <p className="font-bold text-gray-900">Immediate Service</p>
                <p className="text-sm text-gray-500">Technician will arrive within 45-60 mins</p>
            </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-24">
            <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-gray-400" />
                <span className="font-semibold text-sm text-gray-700">Instructions for Technician</span>
            </div>
            <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                placeholder="Ex: Gate code is 1234, beware of dog..."
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
            />
        </div>

        {/* FOOTER ACTION */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-3xl mx-auto flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500 font-medium">Total Estimate</p>
                    <p className="text-2xl font-bold text-gray-900">₹{basePrice}</p>
                </div>
                <button 
                    onClick={handleConfirmBooking}
                    disabled={isBookLoading || !selectedAddressId}
                    className="bg-black hover:bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg shadow-gray-200"
                >
                    {isBookLoading ? 'Booking...' : 'FIND TECHNICIAN'}
                    {!isBookLoading && <ChevronRight size={18} />}
                </button>
            </div>
        </div>
      </div>
 
      <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)} 
          onSubmit={async (formData) => {
              try { 
                  await addAddress(formData);
                   
                  const data = await getMyAddresses();
                  dispatch(setAddresses(data));
                   
                  showSuccess("Address added successfully!");
                  setIsAddressModalOpen(false);
                   
                  const newAddr = data[data.length - 1];  
                  if (newAddr) setSelectedAddressId(newAddr.id);

              } catch (err) {
                  showError("Failed to save address");
                  console.error(err);
              }
          }}
          initialData={null}
          isLoading={false} 
      />
    </div>
  );
};

export default BookingConfirm;