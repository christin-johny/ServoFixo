import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';  

interface ServiceCardProps {
  service: ServiceItem;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();

  const displayImage = service.imageUrls?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';
  const displayPrice = service.basePrice;

  return (
    <div
      onClick={() => navigate(`/services/${service._id}`)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-full group"
    >
      {/* Image Area: h-32 on mobile, h-52 on larger screens */}
      <div className="relative h-32 sm:h-52 bg-gray-100 overflow-hidden">
        <img
          src={displayImage}
          alt={service.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Rating Tag */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span>4.8</span>
        </div>
      </div>

      {/* Content Area: p-3 on mobile, p-5 on larger screens */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-sm sm:text-lg leading-tight line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
          {service.name}
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2 sm:mb-4 flex-1 leading-relaxed">
          {service.description}
        </p>

        <div className="flex items-end justify-between mt-auto pt-2 sm:pt-4 border-t border-gray-50">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-0.5">Starts at</span>
            <span className="font-bold text-green-500 text-sm sm:text-xl">₹{displayPrice}</span>
          </div>
          
          <button className="bg-blue-50 text-blue-600 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-200">
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;