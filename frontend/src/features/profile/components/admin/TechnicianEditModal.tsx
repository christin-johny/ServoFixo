import React, { useState, useEffect } from 'react';
import { 
  X, Save, User, Mail, Phone, Briefcase, MapPin, 
  Layers, Loader2, ChevronDown, ChevronRight, Wrench, CreditCard, Landmark, AlertTriangle, FileText
} from 'lucide-react'; 

import * as techRepo from '../../api/adminTechnicianRepository';
import * as zoneRepo from '../../../zones/api/zoneRepository';
import * as catRepo from '../../../service-catalog/api/categoryRepository';
import * as serviceRepo from '../../../service-catalog/api/serviceRepository';
import type { TechnicianListItem, UpdateTechnicianPayload } from '../../api/adminTechnicianRepository';

interface Option { id: string; name: string; }
interface ServiceOption extends Option { categoryId: string; }
type BankDetailsKeys = keyof NonNullable<UpdateTechnicianPayload['bankDetails']>;

interface TechnicianEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  technician: TechnicianListItem | null;
  onSave: (id: string, data: UpdateTechnicianPayload) => Promise<void>;
}

const TechnicianEditModal: React.FC<TechnicianEditModalProps> = ({
  isOpen,
  onClose,
  technician,
  onSave,
}) => {
  const [formData, setFormData] = useState<UpdateTechnicianPayload>({
    name: '', email: '', phone: '', experienceSummary: '', bio: '',  
    zoneIds: [], categoryIds: [], subServiceIds: [],
    bankDetails: {
      accountHolderName: '', accountNumber: '', bankName: '', ifscCode: ''
    }
  });

  const [fetchingData, setFetchingData] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [availableZones, setAvailableZones] = useState<Option[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Option[]>([]);
  const [availableServices, setAvailableServices] = useState<Record<string, ServiceOption[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && technician) {
      loadDependencies(technician.id);
    }
  }, [isOpen, technician]);

  useEffect(() => {
    if (formData.categoryIds && formData.categoryIds.length > 0) {
      loadServicesForCategories(formData.categoryIds);
    }
  }, [formData.categoryIds]);

  const loadDependencies = async (techId: string) => {
    setFetchingData(true);
    try {
      const [profile, zonesRes, catsRes] = await Promise.all([
        techRepo.getTechnicianProfile(techId),
        zoneRepo.getZones({ page: 1, limit: 100, search: '', isActive: 'true' }),
        catRepo.getCategories({ page: 1, limit: 100, search: '', isActive: 'true' })
      ]);

      setAvailableZones(zonesRes.zones.map(z => ({ id: z.id || '', name: z.name })));
      setAvailableCategories(catsRes.categories.map(c => ({ id: c.id || '', name: c.name })));

      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        experienceSummary: profile.experienceSummary || '',
        bio: profile.bio || '', // Load Bio
        zoneIds: profile.zoneIds || [],
        categoryIds: profile.categoryIds || [],
        subServiceIds: profile.subServiceIds || [],
        bankDetails: {
          accountHolderName: profile.bankDetails?.accountHolderName || '',
          accountNumber: profile.bankDetails?.accountNumber || '',
          bankName: profile.bankDetails?.bankName || '',
          ifscCode: profile.bankDetails?.ifscCode || ''
        }
      });

      if (profile.categoryIds?.length && profile.categoryIds.length <= 3) {
        setExpandedCategories(profile.categoryIds);
      }

    } catch (error) {
      console.error("Failed to load edit data", error);
    } finally {
      setFetchingData(false);
    }
  };

  const loadServicesForCategories = async (categoryIds: string[]) => {
    const missingCats = categoryIds.filter(id => !availableServices[id]);
    if (missingCats.length === 0) return;

    try {
      const promises = missingCats.map(catId => 
        serviceRepo.getServices({ page: 1, limit: 100, categoryId: catId, isActive: 'true' })
          .then(res => ({ catId, services: res.data }))
      );
      const results = await Promise.all(promises);
      setAvailableServices(prev => {
        const next = { ...prev };
        results.forEach(r => {
          next[r.catId] = r.services.map(s => ({ id: s.id, name: s.name, categoryId: r.catId }));
        });
        return next;
      });
    } catch (error) {
      console.error("Failed to fetch services", error);
    }
  };

  const handleToggle = (field: 'zoneIds' | 'categoryIds' | 'subServiceIds', id: string) => {
    setFormData(prev => {
      const list = prev[field] || [];
      const exists = list.includes(id);
      const updated = exists ? list.filter(item => item !== id) : [...list, id];
      if (field === 'categoryIds' && exists) {
        const catServices = availableServices[id]?.map(s => s.id) || [];
        const updatedServices = (prev.subServiceIds || []).filter(sid => !catServices.includes(sid));
        return { ...prev, [field]: updated, subServiceIds: updatedServices };
      }
      return { ...prev, [field]: updated };
    });
  };

  const handleBankChange = (field: BankDetailsKeys, value: string) => {
     setFormData(prev => ({
       ...prev,
       bankDetails: { ...prev.bankDetails!, [field]: value }
     }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technician) return;
    setSaving(true);
    try {
      await onSave(technician.id, formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Increased max-width to 3xl for better readability */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
            <p className="text-sm text-gray-500">Update personal and operational details.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {fetchingData ? (
           <div className="flex-1 flex flex-col items-center justify-center p-12">
               <Loader2 className="animate-spin text-blue-600 mb-3" size={40} />
               <p className="text-base text-gray-500 font-medium">Loading Profile Data...</p>
           </div>
        ) : (
          <div className="overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-300">
            <form id="edit-tech-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* === SECTION 1: IDENTITY & BIO === */}
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">Identity & About</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <div className="relative">
                    <User size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-base font-medium text-gray-900" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-base font-medium text-gray-900" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Phone</label>
                    <div className="relative">
                      <Phone size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-base font-medium text-gray-900" required />
                    </div>
                  </div>
                </div>

                {/* Moved Bio & Experience Here */}
                <div className="space-y-2">
                   <label className="text-sm font-semibold text-gray-700">Bio / About</label>
                   <div className="relative">
                     <FileText size={20} className="absolute left-3.5 top-3.5 text-gray-400" />
                     <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none min-h-[80px] text-base font-medium resize-none text-gray-900" placeholder="Short bio..." />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-semibold text-gray-700">Experience Summary</label>
                   <div className="relative">
                     <Briefcase size={20} className="absolute left-3.5 top-3.5 text-gray-400" />
                     <textarea value={formData.experienceSummary} onChange={(e) => setFormData({...formData, experienceSummary: e.target.value})} 
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none min-h-[100px] text-base font-medium resize-none text-gray-900" placeholder="Detailed professional history..." />
                   </div>
                </div>
              </div>

              {/* === SECTION 2: OPERATIONS === */}
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                    Operations <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded border border-yellow-200 normal-case">Admin Override</span>
                </h4>

                <div className="space-y-2">
                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><MapPin size={16}/> Service Zones</label>
                   <div className="flex flex-wrap gap-2.5">
                      {availableZones.map(zone => (
                          <button type="button" key={zone.id} onClick={() => handleToggle('zoneIds', zone.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${formData.zoneIds?.includes(zone.id) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                          >
                            {zone.name}
                          </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Layers size={16}/> Categories</label>
                   <div className="flex flex-wrap gap-2.5">
                      {availableCategories.map(cat => (
                          <button type="button" key={cat.id} onClick={() => handleToggle('categoryIds', cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${formData.categoryIds?.includes(cat.id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                          >
                            {cat.name}
                          </button>
                      ))}
                   </div>
                </div>

                {formData.categoryIds && formData.categoryIds.length > 0 && (
                   <div className="space-y-3 pt-2">
                     <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Wrench size={16}/> Services Allocation</label>
                     <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                        {formData.categoryIds.map(catId => {
                           const categoryName = availableCategories.find(c => c.id === catId)?.name || 'Unknown';
                           const services = availableServices[catId] || [];
                           const isExpanded = expandedCategories.includes(catId);
                           
                           return (
                             <div key={catId} className="bg-white">
                                <button type="button" onClick={() => setExpandedCategories(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId])}
                                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                >
                                   <span className="text-base font-semibold text-gray-700">{categoryName}</span>
                                   {isExpanded ? <ChevronDown size={20} className="text-gray-400"/> : <ChevronRight size={20} className="text-gray-400"/>}
                                </button>
                                
                                {isExpanded && (
                                   <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {services.length === 0 ? (
                                        <p className="text-sm text-gray-400 col-span-2 italic">Loading services...</p>
                                      ) : (
                                        services.map(svc => (
                                            <label key={svc.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.subServiceIds?.includes(svc.id) ? 'bg-indigo-50 border-indigo-200' : 'border-gray-100 hover:border-gray-200'}`}>
                                               <input type="checkbox" checked={!!formData.subServiceIds?.includes(svc.id)} onChange={() => handleToggle('subServiceIds', svc.id)}
                                                 className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                               />
                                               <span className={`text-sm font-medium ${formData.subServiceIds?.includes(svc.id) ? 'text-indigo-700' : 'text-gray-700'}`}>{svc.name}</span>
                                            </label>
                                        ))
                                      )}
                                   </div>
                                )}
                             </div>
                           );
                        })}
                     </div>
                   </div>
                )}
              </div>

              {/* === SECTION 3: FINANCIALS === */}
              <div className="space-y-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                      Financial Information <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded border border-red-200 normal-case">Sensitive</span>
                  </h4>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex gap-3">
                      <AlertTriangle className="text-red-600 shrink-0" size={20} />
                      <p className="text-sm text-red-700 leading-relaxed">
                          <strong>Warning:</strong> Modifying bank details will affect payouts immediately. Verify details before saving.
                      </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Account Holder Name</label>
                    <div className="relative">
                      <User size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={formData.bankDetails?.accountHolderName} onChange={(e) => handleBankChange('accountHolderName', e.target.value)} 
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-base font-medium text-gray-900" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Bank Name</label>
                          <div className="relative">
                              <Landmark size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input type="text" value={formData.bankDetails?.bankName} onChange={(e) => handleBankChange('bankName', e.target.value)} 
                                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-base font-medium text-gray-900" />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">IFSC Code</label>
                          <input type="text" value={formData.bankDetails?.ifscCode} onChange={(e) => handleBankChange('ifscCode', e.target.value.toUpperCase())} 
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-base font-mono font-medium uppercase text-gray-900" placeholder="ABCD0123456" />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Account Number</label>
                      <div className="relative">
                          <CreditCard size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={formData.bankDetails?.accountNumber} onChange={(e) => handleBankChange('accountNumber', e.target.value)} 
                              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-base font-mono font-medium text-gray-900" />
                      </div>
                  </div>
              </div>

            </form>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-3 text-base font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button type="submit" form="edit-tech-form" disabled={saving || fetchingData} className="px-6 py-3 bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default TechnicianEditModal;