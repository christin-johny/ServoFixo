import React from 'react';
import { User, Layers, CreditCard, Mail, Phone, Briefcase, FileText, Wrench, MapPin, HardHat } from 'lucide-react';
import type { AdminTechnicianProfileDto as TechnicianProfileFull } from '../../../../domain/types/TechnicianVerificationDtos';

/** * ✅ NARROWED TYPE: Defines the specific object structure from your response 
 * to ensure we never render a raw object as a React child.
 */
type EnrichedName = { id: string; name: string };

interface TechnicianProfileSummaryProps {
    profile: TechnicianProfileFull;
}

const TechnicianProfileSummary: React.FC<TechnicianProfileSummaryProps> = ({ profile }) => {

    /** * ✅ TYPE-SAFE RENDERER: Eliminates 'any' by explicitly checking if the item 
     * is a string or an EnrichedName object.
     */
    const renderBadges = (
        data: (string | EnrichedName)[] | undefined, 
        fallbackIds: string[] = [], 
        badgeColor: "gray" | "blue" = "gray"
    ): React.ReactNode => {
        const list = (data && data.length > 0) ? data : fallbackIds;
        
        if (list.length === 0) {
            return <span className="text-gray-400 text-sm italic">None</span>;
        }

        return list.map((item, idx) => {
            // Strict type narrowing to extract only the string name
            const displayName = typeof item === 'object' ? item.name : item;
            const key = typeof item === 'object' ? item.id : `${displayName}-${idx}`;
            
            return <Badge key={key} text={displayName} color={badgeColor} />;
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Personal Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                <CardHeader icon={User} title="Personal Details" />
                <div className="p-5 space-y-4">
                    <InfoRow icon={Mail} label="Email" value={profile.email} />
                    <InfoRow icon={Phone} label="Phone" value={profile.phone} />
                    <InfoRow icon={FileText} label="Bio" value={profile.bio || "No bio provided"} />
                    <InfoRow icon={Briefcase} label="Experience" value={profile.experienceSummary} />
                </div>
            </div>

            {/* Work Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                <CardHeader icon={Layers} title="Work Preferences" />

                <div className="p-5 space-y-5">
                    {/* Service Zones */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                            <MapPin className="w-3.5 h-3.5" />
                            Service Zones
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {renderBadges(profile.zoneNames as (string | EnrichedName)[], profile.zoneIds)}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                            <HardHat className="w-3.5 h-3.5" />
                            Categories
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {renderBadges(profile.categoryNames as (string | EnrichedName)[], profile.categoryIds)}
                        </div>
                    </div>

                    {/* Sub Services */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                            <Wrench className="w-3.5 h-3.5" />
                            Sub Services
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {renderBadges(profile.subServiceNames as (string | EnrichedName)[], profile.subServiceIds, "blue")}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bank Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                <CardHeader icon={CreditCard} title="Bank Information" />
                <div className="p-5 space-y-4">
                    <InfoRow label="Account Holder" value={profile.bankDetails?.accountHolderName} />
                    <InfoRow label="Bank Name" value={profile.bankDetails?.bankName} />
                    <InfoRow label="Account Number" value={profile.bankDetails?.accountNumber} isMono />
                    <InfoRow label="IFSC Code" value={profile.bankDetails?.ifscCode} isMono />
                </div>
            </div>
        </div>
    );
};

// --- Local Helper Components (Strictly Typed) ---

const CardHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
        <Icon size={18} className="text-gray-500" />
        <h3 className="font-bold text-gray-800">{title}</h3>
    </div>
);

const Badge = ({ text, color = "gray" }: { text: string; color?: "gray" | "blue" }) => (
    <span className={`px-2.5 py-1 text-xs rounded-md font-medium border whitespace-nowrap ${
        color === "blue" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"
    }`}>
        {text}
    </span>
);

interface InfoRowProps {
    label: string;
    value?: string;
    isMono?: boolean;
    icon?: React.ElementType;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isMono, icon: Icon }) => (
    <div className="break-words group">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        <p className={`text-gray-900 font-medium ${isMono ? "font-mono text-sm" : "text-sm"}`}>
            {value || "--"}
        </p>
    </div>
);

export default TechnicianProfileSummary;