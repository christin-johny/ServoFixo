import React from 'react';
import { Star } from 'lucide-react';
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
        min-w-[160px] w-[160px] 
        sm:min-w-[200px] sm:w-[200px] 
        md:min-w-[230px] md:w-[230px]
        bg-white rounded-xl border border-gray-100 
        shadow-sm hover:shadow-md hover:border-blue-100 
        transition-all duration-300 overflow-hidden shrink-0 cursor-pointer
      "
      role="button"
    >
      {/* Image Container - Consistent Aspect Ratio */}
      <div className="relative w-full h-28 sm:h-32 md:h-40 bg-gray-50 overflow-hidden">
        <img
          src={service.imageUrls[0] || '/assets/service-placeholder.png'}
          alt={service.name}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
        />
        {/* Floating Rating - Like modern apps */}
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm text-gray-700">
          <Star size={10} className="text-yellow-400 fill-yellow-400" /> 
          {service.rating || '4.8'}
        </div>
      </div>

      {/* Content Area - Uses Flex Grow to align bottoms */}
      <div className="flex flex-col flex-grow p-3 sm:p-4">
        <h4 className="text-sm sm:text-[15px] font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {service.name}
        </h4>
        
        <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
          {service.description}
        </p>

        {/* Price Section - mt-auto pushes this to the very bottom */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Starts at</span>
            <span className="text-sm sm:text-base font-black text-blue-600">₹{service.basePrice}</span>
          </div>
          
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <span className="text-lg font-light">+</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;