import React from 'react';
import { Star,ArrowRight } from 'lucide-react';
import type { ServiceItem } from '../../types/ServiceItem';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: ServiceItem;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();
return (
  <article
    onClick={() => { navigate(`/services/${service.id}`) }}
    className="
      group relative flex flex-col
      /* Crucial: Set a fixed width so they don't shrink */
      min-w-[200px] w-[200px] 
      md:min-w-[260px] md:w-[260px]
      bg-white rounded-2xl border border-gray-100 
      shadow-sm hover:shadow-xl hover:-translate-y-1
      transition-all duration-300 overflow-hidden shrink-0 cursor-pointer
    "
  >
    {/* Image container remains same but uses h-40 for better proportions */}
    <div className="relative w-full h-32 md:h-44 bg-gray-50 overflow-hidden">
      <img
        src={service.imageUrls[0] || '/assets/service-placeholder.png'}
        alt={service.name}
        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm text-gray-800">
        <Star size={12} className="text-yellow-400 fill-yellow-400" /> 
        {service.rating || '4.8'}
      </div>
    </div>

    <div className="flex flex-col flex-grow p-4">
      <h4 className="text-sm md:text-base font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600">
        {service.name}
      </h4>
      
      <p className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[32px]">
        {service.description}
      </p>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tight">Starting from</span>
          <span className="text-base md:text-lg font-black text-blue-600">₹{service.basePrice}</span>
        </div>
        
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
          <ArrowRight size={18} />
        </div>
      </div>
    </div>
  </article>
);
};

export default ServiceCard;