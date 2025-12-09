import React from "react";
import { Edit2, Trash2, ChevronDown, Plus, Package, Clock, Shield } from "lucide-react";
import type { ServiceCategory } from "../../../domain/types/ServiceCategory";
import type { ServiceItem } from "../../../domain/types/ServiceItem";

interface CategoryCardProps {
  category: ServiceCategory;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  
  services: ServiceItem[];
  isLoadingServices: boolean;
  onAddService: () => void;
  onEditService: (service: ServiceItem) => void;
  onDeleteService: (serviceId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  services,
  isLoadingServices,
  onAddService,
  onEditService,
  onDeleteService,
}) => {
  return (
    <div 
      className={`
        bg-white rounded-2xl border transition-all duration-200 overflow-hidden 
        ${isExpanded ? "shadow-md ring-1 ring-blue-500/20 border-blue-200" : "border-gray-200 hover:border-blue-300 hover:shadow-sm"}
        
        /* ✅ LEFT STATUS STRIP (Category) */
        border-l-[6px] 
        ${category.isActive ? "border-l-green-500" : "border-l-gray-300"}
      `}
    >
      
      {/* --- Header (Parent Category) --- */}
      <div onClick={onToggleExpand} className="p-4 flex items-center gap-4 cursor-pointer group select-none">
        
        {/* Icon */}
        <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-50 border border-gray-100 p-1">
          <img src={category.iconUrl} alt={category.name} className={`w-full h-full object-cover rounded-lg ${!category.isActive && "opacity-50 grayscale"}`} loading="lazy" />
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-base font-bold truncate ${category.isActive ? "text-gray-900" : "text-gray-500"}`}>
                {category.name}
            </h3>
            
            {/* ✅ SHOW "INACTIVE" TAG ONLY IF INACTIVE */}
            {!category.isActive && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onEdit(e); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(e); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
          <div className="w-px h-8 bg-gray-200 mx-1" />
          <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-500" : ""}`}><ChevronDown size={20} /></div>
        </div>
      </div>

      {/* --- Expanded Section (Service Items) --- */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 animate-in slide-in-from-top-2 duration-200">
          
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Services in this Category</h4>
            <button onClick={onAddService} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-blue-600 text-xs font-bold rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm">
              <Plus size={14} /> Add Service
            </button>
          </div>

          {isLoadingServices ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-white">
              <Package className="mx-auto text-gray-300 mb-2" size={24} />
              <p className="text-gray-500 text-sm font-medium">No services added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div 
                    key={service._id} 
                    className={`
                        bg-white p-3 rounded-xl border flex gap-4 transition-colors group relative overflow-hidden
                        hover:border-blue-300 
                        ${service.isActive ? "border-gray-200" : "border-gray-200 bg-gray-50/50"}
                        
                        /* ✅ LEFT STATUS STRIP (Service Item) */
                        border-l-[4px]
                        ${service.isActive ? "border-l-green-500" : "border-l-gray-300"}
                    `}
                >
                  
                  {/* Service Image */}
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-100 overflow-hidden relative">
                    {service.imageUrls[0] ? (
                      <img src={service.imageUrls[0]} alt={service.name} className={`w-full h-full object-cover ${!service.isActive && "opacity-50 grayscale"}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h5 className={`text-sm font-bold ${service.isActive ? "text-gray-900" : "text-gray-500"}`}>
                            {service.name}
                        </h5>

                        {/* ✅ SHOW "INACTIVE" TAG ONLY IF INACTIVE */}
                        {!service.isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-200 text-gray-500 border border-gray-300 uppercase tracking-wide">
                              Inactive
                            </span>
                        )}
                      </div>

                      <span className={`text-sm font-bold ${service.isActive ? "text-blue-600" : "text-gray-400"}`}>
                        ₹{service.basePrice}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{service.description}</p>
                    
                    {/* Specs Pills */}
                    <div className="flex gap-2 mt-2">
                      {service.specifications.slice(0, 2).map((spec, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-100">
                          {spec.title === 'Warranty' ? <Shield size={10} /> : <Clock size={10} />}
                          {spec.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEditService(service)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 size={14} /></button>
                    <button onClick={() => onDeleteService(service._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;