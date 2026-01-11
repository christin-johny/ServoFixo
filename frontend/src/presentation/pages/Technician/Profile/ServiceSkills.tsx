import React from "react";
import { useSelector } from "react-redux";
import {
    MapPin, Briefcase, Wrench, ShieldCheck,
    ArrowLeft, AlertCircle, CheckCircle2, PenTool
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../../store/store";

const ServiceSkills: React.FC = () => {
    const navigate = useNavigate();
    const { profile } = useSelector((state: RootState) => state.technician);

    if (!profile) return null;

    // Helper: Group SubServices by Category
    const getServicesByCategory = () => {
        if (!profile.categories || !profile.subServices) return [];

        return profile.categories.map(cat => ({
            ...cat,
            services: profile.subServices?.filter(s => s.categoryId === cat.id) || []
        }));
    };

    const groupedServices = getServicesByCategory();

    return (
        <div className="w-full space-y-6 animate-fade-in pb-12">

            {/* --- 1. NAVIGATION (Back Button) --- */}
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

            {/* --- 2. MINIMAL HEADER + SINGLE ACTION --- */}
            <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:justify-between">
                {/* Heading Section */}
                <div className="max-w-full">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Services & Competencies
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your operational zones and specialized skills.
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => { /* TODO: Open Unified Request Modal */ }}
                    className="
                        flex w-full sm:w-auto items-center justify-center gap-2
                        px-5 py-2.5 text-sm font-bold
                        text-white bg-blue-600 hover:bg-blue-700
                        rounded-xl shadow-lg shadow-blue-600/20
                        transition-all active:scale-95
                        ">
                    <PenTool className="h-4 w-4" />
                    Request Update
                </button>
            </div>


            {/* --- 3. CONTENT GRID --- */}
            <div className="grid md:grid-cols-12 gap-6">

                {/* LEFT: SERVICE ZONES (Col-4) */}
                <div className="md:col-span-4 space-y-6 order-2 md:order-1">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full">
                        <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Active Zones
                            </h3>
                            <span className="text-[10px] font-bold bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">
                                {profile.serviceZones?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-3">
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

                        {/* Info Note */}
                        <div className="mt-6 flex gap-3 items-start opacity-75">
                            <AlertCircle className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                To change zones, click "Request Update" above. Changes require admin approval.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: CATEGORIES & SKILLS (Col-8) */}
                <div className="md:col-span-8 space-y-6 order-1 md:order-2">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" /> Active Competencies
                            </h3>
                        </div>

                        {groupedServices.length > 0 ? (
                            <div className="space-y-6">
                                {groupedServices.map((group) => (
                                    <div key={group.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                        {/* Category Header */}
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

                                        {/* Services Grid */}
                                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                                            {group.services.map((service) => (
                                                <div key={service.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/30 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                                                    <span className="text-sm font-medium text-gray-700">{service.name}</span>
                                                    <ShieldCheck className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
        </div>
    );
};

export default ServiceSkills;