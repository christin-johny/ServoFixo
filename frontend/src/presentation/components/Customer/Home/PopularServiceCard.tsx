import React from 'react';
import { Star } from 'lucide-react';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';
import { useNavigate } from 'react-router-dom';

interface Props { service: ServiceItem }

const PopularServiceCard: React.FC<Props> = ({ service }) => {
  const navigate = useNavigate()
  return (
    <article
    onClick={()=>{navigate(`/services/${service._id}`)}}
      className="
        group relative flex flex-col
        w-full h-full
        bg-white rounded-xl
        border border-gray-100
        transition-all duration-300
        hover:shadow-lg hover:border-transparent
        overflow-hidden
        cursor-pointer
      "
      role="button"
      aria-label={service.name}
    >

      <div className="relative w-full h-32 sm:h-40 md:h-48 bg-gray-50 flex items-center justify-center p-4">
        <img
          src={service.imageUrls?.[0] || '/assets/service-placeholder.png'}
          alt={service.name}
          className="w-full h-full object-contain transform transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow p-3 sm:p-4">
        
        {/* Title */}
        <h4 className="text-sm sm:text-[15px] font-bold text-gray-900 line-clamp-2 leading-tight mb-1">
          {service.name}
        </h4>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mt-1 mb-2">
          <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded text-green-700">
             <Star size={10} className="fill-current text-green-700" />
             <span className="text-[10px] sm:text-xs font-bold">{service?.rating ?? '4.8'}</span>
          </div>
          <span className="text-[10px] sm:text-xs text-gray-400">
            ({service?.reviewCount ?? '1k'})
          </span>
        </div>

        {/* Price Section - Pushed to bottom of card */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium">Starts at</span>
            <span className="text-sm sm:text-base font-bold text-gray-900">
              ₹{service.basePrice}
            </span>
          </div>
          
        </div>
      </div>
    </article>
  );
};

export default PopularServiceCard;