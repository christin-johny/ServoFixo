import React from "react";
import { Edit2, Trash2, ChevronDown } from "lucide-react";
import type { ServiceCategory } from "../../../domain/types/ServiceCategory";

interface CategoryCardProps {
  category: ServiceCategory;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}) => {
  return (
    <div 
      className={`
        bg-white rounded-2xl border transition-all duration-200 overflow-hidden
        ${isExpanded ? "border-blue-500 shadow-md ring-1 ring-blue-500/20" : "border-gray-200 hover:border-blue-300 hover:shadow-sm"}
      `}
    >
      {/* --- Main Card Header (Always Visible) --- */}
      <div 
        onClick={onToggleExpand}
        className="p-4 flex items-center gap-4 cursor-pointer group"
      >
        {/* Icon from S3 */}
        <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-50 border border-gray-100 p-1">
          <img 
            src={category.iconUrl} 
            alt={category.name} 
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
          />
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-gray-900 truncate">{category.name}</h3>
            {!category.isActive && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
        </div>

        {/* Actions (Prevent bubble up to expand) */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(e); }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Category"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Category"
          >
            <Trash2 size={18} />
          </button>
          <div className="w-px h-8 bg-gray-200 mx-1" />
          <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-500" : ""}`}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {/* We will implement the sub-services loading here in the next step */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="text-center py-8 text-gray-400 text-sm">
            <p>Sub-services will be loaded here...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;