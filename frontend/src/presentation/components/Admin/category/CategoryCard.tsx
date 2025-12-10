import React from "react";
import { Edit2, Trash2, ChevronDown, Plus, Package, Clock, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import type { ServiceCategory } from "../../../../domain/types/ServiceCategory";
import type { ServiceItem } from "../../../../domain/types/ServiceItem";

interface CategoryCardProps {
  category: ServiceCategory;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onToggleStatus: (e: React.MouseEvent) => void;
  services: ServiceItem[];
  isLoadingServices: boolean;
  onAddService: () => void;
  onEditService: (service: ServiceItem) => void;
  onDeleteService: (serviceId: string) => void;
  onToggleServiceStatus: (service: ServiceItem) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleStatus,
  services,
  isLoadingServices,
  onAddService,
  onEditService,
  onDeleteService,
  onToggleServiceStatus
}) => {
  return (
    <div 
      className={`
        bg-white rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden 
        ${isExpanded ? "shadow-md ring-1 ring-blue-500/20 border-blue-200" : "border-gray-200 hover:border-blue-300 hover:shadow-sm"}
        border-l-[4px] sm:border-l-[6px] 
        ${category.isActive ? "border-l-green-500" : "border-l-gray-300"}
      `}
    >
      
      {/* --- Header (Parent Category) --- */}
      <div 
        onClick={onToggleExpand} 
        className="p-2.5 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer group select-none relative"
      >
        
        {/* Category Icon (Significantly smaller on mobile) */}
        <div className="w-9 h-9 sm:w-16 sm:h-16 shrink-0 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100 p-0.5 sm:p-1">
          <img src={category.iconUrl} alt={category.name} className={`w-full h-full object-cover rounded-md sm:rounded-lg ${!category.isActive && "opacity-50 grayscale"}`} loading="lazy" />
        </div>

        {/* Category Info */}
        {/* pr-24 on mobile ensures text truncates BEFORE hitting the buttons */}
        <div className="flex-1 min-w-0 pr-24 sm:pr-0">
          <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
            <h3 className={`text-sm sm:text-base font-bold truncate ${category.isActive ? "text-gray-900" : "text-gray-500"}`}>
                {category.name}
            </h3>
            {!category.isActive && (
              <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">Inactive</span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
                      {category.description.length > 50
                        ? `${category.description.substring(0, 80)}...`
                        : category.description}
                    </p>
        </div>

        {/* Actions Container */}
        <div className="absolute right-8 sm:right-14 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2
                        opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
            
            {/* Toggle (Mobile: Compact) */}
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleStatus(e); }} 
                className={`p-1 sm:p-2 rounded-lg transition-colors ${category.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
            >
                {category.isActive 
                    ? <ToggleRight className="w-5 h-5 sm:w-6 sm:h-6" /> 
                    : <ToggleLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                }
            </button>

            {/* Edit */}
            <button onClick={(e) => { e.stopPropagation(); onEdit(e); }} className="p-1 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                <Edit2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Delete */}
            <button onClick={(e) => { e.stopPropagation(); onDelete(e); }} className="p-1 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
        </div>
        
        {/* Chevron Separator & Icon */}
        <div className="hidden sm:block h-8 w-px bg-gray-200 mx-1" />
        <div className={`absolute right-2 sm:static text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-500" : ""}`}>
            <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* --- Expanded Section (Service Items) --- */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-2 sm:p-4 animate-in slide-in-from-top-2 duration-200">
          
          <div className="flex justify-between items-center mb-3 sm:mb-4 px-1">
            <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Services</h4>
            <button onClick={onAddService} className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white border border-gray-200 text-blue-600 text-[10px] sm:text-xs font-bold rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm">
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Add Service</span><span className="sm:hidden">Add</span>
            </button>
          </div>

          {isLoadingServices ? (
            <div className="text-center py-6 text-gray-400 text-xs sm:text-sm">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-white mx-1">
              <Package className="mx-auto text-gray-300 mb-1" size={20} />
              <p className="text-gray-500 text-xs font-medium">No services added.</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {services.map((service) => (
                <div 
                    key={service._id} 
                    className={`
                        bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl border flex gap-3 transition-colors group relative overflow-hidden
                        hover:border-blue-300 
                        ${service.isActive ? "border-gray-200" : "border-gray-200 bg-gray-50/50"}
                        border-l-[3px] sm:border-l-[4px]
                        ${service.isActive ? "border-l-green-500" : "border-l-gray-300"}
                    `}
                >
                  {/* Service Image (Very compact on mobile) */}
                  <div className="w-8 h-8 sm:w-12 sm:h-12 shrink-0 rounded bg-gray-100 overflow-hidden relative mt-0.5">
                    {service.imageUrls[0] ? (
                      <img src={service.imageUrls[0]} alt={service.name} className={`w-full h-full object-cover ${!service.isActive && "opacity-50 grayscale"}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={16} /></div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0 pr-20 sm:pr-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div className="flex items-center gap-2">
                        <h5 className={`text-xs sm:text-sm font-bold truncate ${service.isActive ? "text-gray-900" : "text-gray-500"}`}>
                            {service.name}
                        </h5>
                        {!service.isActive && (
                            <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-200 text-gray-500 border border-gray-300 uppercase tracking-wide">Inactive</span>
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${service.isActive ? "text-blue-600" : "text-gray-400"} mt-0.5 sm:mt-0`}>
                        ₹{service.basePrice}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {service.description.length > 50
                        ? `${service.description.substring(0, 80)}...`
                        : service.description}
                    </p>
                    {/* Specs Pills (Hidden on very small screens) */}
                    <div className="hidden sm:flex gap-2 mt-2">
                      {service.specifications.slice(0, 2).map((spec, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-100">
                          {spec.title === 'Warranty' ? <Shield size={10} /> : <Clock size={10} />}
                          {spec.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Service Actions: Always Visible on Mobile */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 sm:static sm:translate-y-0 
                                  flex items-center gap-0.5 sm:gap-1 
                                  opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    
                    <button 
                        onClick={() => onToggleServiceStatus(service)}
                        className={`p-1 sm:p-1.5 rounded-md ${service.isActive ? 'text-green-600' : 'text-red-500'}`}
                    >
                        {service.isActive 
                            ? <ToggleRight className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> 
                            : <ToggleLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        }
                    </button>
                    <button onClick={() => onEditService(service)} className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600">
                        <Edit2 className="w-3.5 h-3.5 sm:w-[14px] sm:h-[14px]" />
                    </button>
                    <button onClick={() => onDeleteService(service._id)} className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5 sm:w-[14px] sm:h-[14px]" />
                    </button>
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