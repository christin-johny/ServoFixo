import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
    MapPin, Briefcase, Wrench, ShieldCheck,
    ArrowLeft, AlertCircle, CheckCircle2,
    Clock, RefreshCw, Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../../store/store";

// ✅ Import BOTH Modals
import ServiceRequestModal from "../../../components/Technician/Modals/ServiceRequestModal";
import ZoneRequestModal from "../../../components/Technician/Modals/ZoneRequestModal";

const ServiceSkills: React.FC = () => {
    const navigate = useNavigate();
    const { profile } = useSelector((state: RootState) => state.technician);
    
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

    if (!profile) return null;

    // --- Helper: Group services by category for display ---
    const getServicesByCategory = () => {
        if (!profile.categories || !profile.subServices) return [];
        return profile.categories.map(cat => ({
            ...cat,
            services: profile.subServices?.filter(s => s.categoryId === cat.id) || []
        }));
    };

    const groupedServices = getServicesByCategory();
    
    // ✅ Extract Granular Pending Data
    const pendingServices = profile.serviceRequests.filter(r => r.status === "PENDING");
    const pendingZones = profile.zoneRequests.filter(r => r.status === "PENDING");

    const hasPendingServiceRequest = pendingServices.length > 0;
    const hasPendingZoneRequest = pendingZones.length > 0;

    // ✅ Map of specific service IDs that are currently pending
    const pendingServiceIds = new Set(pendingServices.map(r => r.serviceId));

    return (
        <div className="w-full space-y-6 animate-fade-in pb-12">

            {/* --- 1. NAVIGATION --- */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-1"
                >
                    <div className="p-1 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Profile
                </button>
            </div>

            {/* --- 2. HEADER --- */}
            <div className="flex flex-col gap-1 px-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Services & Competencies
                </h1>
                <p className="text-sm text-gray-500">
                    Manage your operational zones and specialized skills.
                </p>
            </div>

            {/* --- 3. PENDING REQUESTS SUMMARY BANNER --- */}
            {(hasPendingServiceRequest || hasPendingZoneRequest) && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                    <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">Verification in Progress</h4>
                        <div className="text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                            {hasPendingServiceRequest && <span>• {pendingServices.length} service request(s) under review</span>}
                            {hasPendingZoneRequest && <span>• Zone transfer request under review</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* --- 4. CONTENT GRID --- */}
            <div className="grid md:grid-cols-12 gap-6">

                {/* LEFT: SERVICE ZONES (Col-4) */}
                <div className="md:col-span-4 space-y-6 order-2 md:order-1">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Active Zones
                            </h3>
                            
                            {/* ✅ Button state reflects pending zone request status */}
                            <button 
                                onClick={() => setIsZoneModalOpen(true)}
                                disabled={hasPendingZoneRequest}
                                className={`
                                    flex items-center gap-1.5 
                                    px-3 py-1.5 text-xs font-bold 
                                    rounded-lg transition-all
                                    ${hasPendingZoneRequest 
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                                        : "text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 active:scale-95"
                                    }
                                `}
                            >
                                {hasPendingZoneRequest ? (
                                    <>
                                        <Clock className="w-3.5 h-3.5" />
                                        Pending
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Transfer
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="space-y-3 flex-grow">
                            {profile.serviceZones && profile.serviceZones.length > 0 ? (
                                profile.serviceZones.map((zone) => (
                                    <div key={zone.id} className="relative flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
                                        <div className="p-1.5 bg-white rounded-lg shadow-sm text-blue-600">
                                            <MapPin className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{zone.name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Primary Area</p>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">No zones assigned.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex gap-3 items-start opacity-75">
                            <AlertCircle className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                Zone transfers require admin approval. You cannot request a new transfer while one is pending.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: CATEGORIES & SKILLS (Col-8) */}
                <div className="md:col-span-8 space-y-6 order-1 md:order-2">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 min-h-[400px]">
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" /> Active Competencies
                            </h3>

                            <button
                                onClick={() => setIsServiceModalOpen(true)}
                                disabled={hasPendingServiceRequest}
                                className={`
                                    flex items-center gap-1.5 
                                    px-3 py-1.5 text-xs font-bold 
                                    rounded-lg transition-all
                                    ${hasPendingServiceRequest 
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                                        : "text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 active:scale-95"
                                    }
                                `}
                            >
                                {hasPendingServiceRequest ? (
                                    <>
                                        <Clock className="w-3.5 h-3.5" />
                                        Pending Review
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Service
                                    </>
                                )}
                            </button>
                        </div>

                        {groupedServices.some(g => g.services.length > 0) ? (
                            <div className="space-y-6">
                                {groupedServices.map((group) => (
                                    group.services.length > 0 && (
                                    <div key={group.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <div className="bg-gray-50 px-5 py-3 flex items-center gap-3 border-b border-gray-100">
                                            <div className="p-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                                                {group.iconUrl ? (
                                                    <img src={group.iconUrl} alt={group.name} className="w-4 h-4 object-contain" />
                                                ) : (
                                                    <Wrench className="w-4 h-4 text-gray-500" />
                                                )}
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900">{group.name}</h4>
                                            <span className="ml-auto text-[10px] font-bold bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md shadow-sm">
                                                {group.services.length} Services
                                            </span>
                                        </div>

                                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                                            {group.services.map((service) => {
                                                // ✅ Check if this specific service is pending approval
                                                const isPending = pendingServiceIds.has(service.id);
                                                
                                                return (
                                                    <div 
                                                        key={service.id} 
                                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                                            isPending 
                                                            ? "border-orange-100 bg-orange-50/30 opacity-80" 
                                                            : "border-gray-100 bg-gray-50/30 hover:border-blue-100 hover:bg-blue-50/30"
                                                        }`}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                            isPending ? "bg-orange-400 animate-pulse" : "bg-green-500"
                                                        }`}></div>
                                                        
                                                        <span className={`text-sm font-medium ${isPending ? "text-gray-500 italic" : "text-gray-700"}`}>
                                                            {service.name}
                                                        </span>

                                                        {isPending ? (
                                                            <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-orange-600 uppercase tracking-tight">
                                                                <Clock className="w-3 h-3" />
                                                                Pending
                                                            </div>
                                                        ) : (
                                                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 ml-auto" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Briefcase className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No Skills Listed</h3>
                                <p className="text-sm text-gray-500 max-w-xs mt-2 mb-6">
                                    It looks like you haven't been assigned any services yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ServiceRequestModal 
                isOpen={isServiceModalOpen} 
                onClose={() => setIsServiceModalOpen(false)} 
            />
            
            <ZoneRequestModal 
                isOpen={isZoneModalOpen} 
                onClose={() => setIsZoneModalOpen(false)} 
            />

        </div>
    );
};

export default ServiceSkills;