import React from 'react';
import { Star } from 'lucide-react';
import type { ServiceItem } from '../../../../../domain/types/ServiceItem';

interface ServiceCardProps {
  service: ServiceItem;
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden shrink-0 group cursor-pointer hover:shadow-lg transition-all"
    >
      {/* Image Section */}
      <div className="h-28 md:h-36 bg-gray-100 relative overflow-hidden">
        <img 
          src={service.imageUrls[0] || '/assets/service-placeholder.png'} 
          alt={service.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
          <Star size={10} className="text-yellow-500 fill-yellow-500" /> 4.8
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 md:p-4">
        <h4 className="text-sm md:text-base font-bold text-gray-900 line-clamp-1">
          {service.name}
        </h4>
        <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2 mt-1 h-8">
          {service.description}
        </p>
        
        {/* Price & Add Button */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-100">
          <div className="flex flex-col">
             <span className="text-sm md:text-base font-bold text-gray-900">₹{service.basePrice}</span>
          </div>
          <button className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
            ADD
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;