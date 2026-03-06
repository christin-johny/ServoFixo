import React from 'react';
import { Star,ArrowRight } from 'lucide-react';
import type { ServiceItem } from '../../types/ServiceItem';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: ServiceItem;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();
  
  // ServiceCard.tsx

return (
  <article
    onClick={() => { navigate(`/services/${service.id}`) }}
    className="
      group relative flex flex-col h-full
      /* Force consistent width so they don't squish */
      min-w-[200px] w-[200px] 
      md:min-w-[240px] md:w-[240px]
      bg-white rounded-2xl border border-gray-100 
      shadow-sm hover:shadow-xl hover:-translate-y-1
      transition-all duration-300 overflow-hidden shrink-0 cursor-pointer
    "
    role="button"
  >
    {/* Image Container */}
    <div className="relative w-full h-32 md:h-40 bg-gray-50 overflow-hidden">
      <img
        src={service.imageUrls[0] || '/assets/service-placeholder.png'}
        alt={service.name}
        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm text-gray-700">
        <Star size={10} className="text-yellow-400 fill-yellow-400" /> 
        {service.rating || '4.8'}
      </div>
    </div>

    {/* Content Area - flex-grow makes this expand to fill space */}
    <div className="flex flex-col flex-grow p-4">
      <h4 className="text-sm md:text-base font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
        {service.name}
      </h4>
      
      {/* Description with fixed min-height ensures vertical alignment */}
      <p className="text-[11px] md:text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
        {service.description}
      </p>

      {/* Price Section - mt-auto pins this to the bottom */}
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Starts at</span>
          <span className="text-sm md:text-base font-black text-blue-600">₹{service.basePrice}</span>
        </div>
        
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  </article>
);
};

export default ServiceCard;