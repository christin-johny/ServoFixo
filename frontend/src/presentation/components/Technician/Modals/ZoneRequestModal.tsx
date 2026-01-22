import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Loader2, AlertTriangle, ArrowRight, MapPin } from "lucide-react";

import Modal from "../../Shared/Modal/Modal";
import type { RootState } from "../../../../store/store";
import { addZoneRequest } from "../../../../store/technicianSlice";
import { requestZoneTransfer } from "../../../../infrastructure/repositories/technician/technicianProfileRepository";
import { technicianOnboardingRepository, type ZoneOption } from "../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { type ZoneRequest } from "../../../../domain/types/TechnicianRequestTypes";
import { useNotification } from "../../../hooks/useNotification";

import TechnicianZoneSelectMap from "../Onboarding/Maps/TechnicianZoneSelectMap";

interface ZoneRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ZoneRequestModal: React.FC<ZoneRequestModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { profile } = useSelector((state: RootState) => state.technician);
    const { showSuccess, showError } = useNotification();

    // --- State ---
    const [allZones, setAllZones] = useState<ZoneOption[]>([]);
    const [loadingZones, setLoadingZones] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [currentZoneId, setCurrentZoneId] = useState("");
    const [requestedZoneId, setRequestedZoneId] = useState("");

    // --- 1. Fetch Master Zone List ---
    useEffect(() => {
        if (isOpen) {
            const fetchZones = async () => {
                setLoadingZones(true);
                try {
                    const zones = await technicianOnboardingRepository.getZones();
                    setAllZones(zones);

                    // Auto-select current zone if user only has one
                    if (profile?.serviceZones && profile.serviceZones.length === 1) {
                        setCurrentZoneId(profile.serviceZones[0].id);
                    }
                } catch {
                    showError("Failed to load zones.");
                    onClose();
                } finally {
                    setLoadingZones(false);
                }
            };
            fetchZones();
        }
    }, [isOpen, profile]);

    // --- 2. Filter Logic ---
    // "To" list should exclude the selected "From" zone
    const availableTargetZones = allZones.filter(z => z.id !== currentZoneId);

    // --- 3. Handlers ---
    const handleMapZoneClick = (zoneId: string) => {
        setRequestedZoneId(zoneId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentZoneId || !requestedZoneId) {
            showError("Please select both current and target zones.");
            return;
        }

        try {
            setIsSubmitting(true);

            // Step A: Submit to Backend
            await requestZoneTransfer({
                currentZoneId,
                requestedZoneId
            });

            // Step B: Optimistic Update (Redux)
            const optimisticRequest: ZoneRequest = {
                currentZoneId,
                requestedZoneId,
                status: "PENDING",
                adminComments: "",
                requestedAt: new Date().toISOString()
            };

            dispatch(addZoneRequest(optimisticRequest));

            showSuccess("Zone transfer request submitted.");
            handleClose();

        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Failed to submit request.";

            showError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setCurrentZoneId("");
        setRequestedZoneId("");
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title="Request Zone Transfer"
            maxWidth="max-w-4xl" //   WIDER MODAL FOR MAP
        >
            <div className="space-y-6">

                {/* Warning Banner */}
                <div className="bg-orange-50 p-4 rounded-xl flex gap-3 items-start text-sm text-orange-800 border border-orange-100">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
                    <p>
                        <strong>Important:</strong> You cannot transfer zones if you have
                        <span className="font-bold"> active or upcoming jobs</span>.
                        Please complete all assigned work in your current zone first.
                    </p>
                </div>

                {loadingZones ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        
                        {/* LEFT COLUMN: Inputs */}
                        <form onSubmit={handleSubmit} className="w-full lg:w-1/3 flex flex-col gap-5">
                            
                            {/* FROM */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3" /> Transfer From
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        value={currentZoneId}
                                        onChange={(e) => {
                                            setCurrentZoneId(e.target.value);
                                            setRequestedZoneId(""); // Reset target if source changes
                                        }}
                                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-sm font-medium appearance-none"
                                    >
                                        <option value="">Current Zone</option>
                                        {profile?.serviceZones?.map(z => (
                                            <option key={z.id} value={z.id}>{z.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* TO */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3 text-green-600" /> Transfer To
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                                    <select
                                        value={requestedZoneId}
                                        onChange={(e) => setRequestedZoneId(e.target.value)}
                                        disabled={!currentZoneId}
                                        className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-sm font-bold appearance-none disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400"
                                    >
                                        <option value="">Select New Zone</option>
                                        {availableTargetZones.map(z => (
                                            <option key={z.id} value={z.id}>{z.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-[10px] text-gray-400">
                                    Select from the list or click on the map.
                                </p>
                            </div>

                            <div className="flex-grow" />

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-auto">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !currentZoneId || !requestedZoneId}
                                    className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Wait...
                                        </>
                                    ) : (
                                        "Submit"
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* RIGHT COLUMN: Map */}
                        <div className="w-full lg:w-2/3 h-[400px] lg:h-auto rounded-xl overflow-hidden border border-gray-200 relative bg-gray-50">
                            {currentZoneId ? (
                                <>
                                    <TechnicianZoneSelectMap 
                                        zones={availableTargetZones} // Only show CANDIDATE zones
                                        selectedZoneIds={[requestedZoneId]} 
                                        onZoneClick={handleMapZoneClick} 
                                    />
                                    {/* Map Legend/Overlay */}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-100 text-xs z-[400]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-3 h-3 bg-green-500 rounded-sm opacity-50"></div>
                                            <span>Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-blue-600 rounded-sm opacity-50"></div>
                                            <span className="font-bold">Selected</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <MapPin className="w-10 h-10 mb-2 opacity-20" />
                                    <p className="text-sm font-medium">Select your "Current Zone" first</p>
                                    <p className="text-xs">to see transfer options</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ZoneRequestModal;