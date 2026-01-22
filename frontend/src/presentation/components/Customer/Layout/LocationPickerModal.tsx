import React, { useState, useEffect } from "react";
import { X, Navigation, ChevronRight, AlertCircle, MapPin, CheckCircle2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../../store/store";
import { setCurrentLocation, setAddresses, fetchAddressesStart, type Address } from "../../../../store/customerSlice";
import { getZoneByLocation, getMyAddresses, setDefaultAddress } from "../../../../infrastructure/repositories/customer/customerRepository";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const LocationPickerModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { addresses, addressLoading } = useSelector((state: RootState) => state.customer);
    const [addressZones, setAddressZones] = useState<Record<string, string>>({});

    //   Load addresses and resolve their zone names for display
    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                dispatch(fetchAddressesStart());
                try {
                    const data = await getMyAddresses();
                    dispatch(setAddresses(data));

                    // Resolve zone names for each coordinate
                    const zonePromises = data.map(async (addr) => {
                        const zone = await getZoneByLocation(addr.location.lat, addr.location.lng);
                        return { id: addr.id, zone };
                    });
                    const zones = await Promise.all(zonePromises);
                    const zoneMap = zones.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.zone }), {});
                    setAddressZones(zoneMap);
                } catch (error) {
                    console.error("Failed to load address data:", error);
                }
            };
            loadData();
        }
    }, [isOpen, dispatch]);

    //   Selection handler for specific addresses
    const handleSelectLocation = async (addr: Address) => {
        if (!addr.isServiceable) return;

        try {
            // Automatically set as default in DB for persistence
            await setDefaultAddress(addr.id); 

            const zoneName = addressZones[addr.id] || addr.city;
            
            dispatch(setCurrentLocation({
                name: zoneName,
                coords: addr.location,
                isManual: true
            }));
            
            onClose();
        } catch (error) {
            console.error("Address selection failed:", error);
        }
    };

    //   NEW: Re-added Get Current Location (GPS) logic
    const handleGeolocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const zoneName = await getZoneByLocation(latitude, longitude);
                        
                        // Treat GPS detection as a manual override
                        dispatch(setCurrentLocation({
                            name: zoneName,
                            coords: { lat: latitude, lng: longitude },
                            isManual: true
                        }));
                        onClose();
                    } catch {
                        alert("We don't serve this area yet.");
                    }
                },
                () => alert("Location access denied. Please check your browser settings.")
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-gray-800 text-lg">Select Service Location</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
                    
                    {/*   Get Current Location Button */}
                    <button 
                        onClick={handleGeolocation}
                        className="w-full flex items-center gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-50 transition-all font-bold text-sm shadow-sm"
                    >
                        <Navigation size={18} fill="currentColor" className="animate-pulse" /> 
                        Use current location (GPS)
                    </button>

                    <div className="space-y-3 pt-2">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">
                            Saved Locations
                        </p>
                        
                        {addressLoading ? (
                             <div className="py-10 text-center text-gray-400 text-sm">Detecting zones...</div>
                        ) : addresses.length > 0 ? (
                            <div className="space-y-3">
                                {addresses.map((addr: Address) => (
                                    <button
                                        key={addr.id}
                                        disabled={!addr.isServiceable}
                                        onClick={() => handleSelectLocation(addr)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left relative overflow-hidden group ${
                                            addr.isServiceable 
                                                ? 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg' 
                                                : 'opacity-60 grayscale cursor-not-allowed border-gray-100 bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            addr.isServiceable ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                            <MapPin size={22} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="font-bold text-[15px] text-gray-900 truncate">
                                                    {addressZones[addr.id] || addr.city}
                                                </p>
                                                {!addr.isServiceable && (
                                                    <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase font-bold">
                                                        Not Serviceable
                                                    </span>
                                                )}
                                                {addr.isDefault && <CheckCircle2 size={14} className="text-green-500" />}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{addr.fullAddress}</p>
                                        </div>
                                        {addr.isServiceable && <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                                <AlertCircle className="mx-auto text-gray-300 mb-2" size={32} />
                                <h4 className="text-sm text-gray-900 font-bold">No saved addresses</h4>
                                <p className="text-xs text-gray-400 px-10 mt-1">Add an address in your profile to select it here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerModal;