import React from 'react';
import { Star } from 'lucide-react';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: ServiceItem;
}


const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => { navigate(`/services/${service._id}`) }}
      className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden shrink-0 group cursor-pointer hover:shadow-md hover:border-blue-100 transition-all duration-300"
    >
      {/* Image Section */}
      <div className="h-32 md:h-40 bg-gray-50 relative overflow-hidden">
        <img
          src={service.imageUrls[0] || '/assets/service-placeholder.png'}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Rating pill with slightly better contrast */}
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm text-gray-700">
          <Star size={10} className="text-yellow-400 fill-yellow-400" /> 4.8
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col h-[130px] justify-between">
        <div>
          <h4 className="text-[15px] md:text-base font-bold text-gray-900 line-clamp-1 leading-tight group-hover:text-blue-600 transition-colors">
            {service.name}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Redesigned Price Section (No Button) */}
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">from</span>
          <span className="text-lg md:text-xl font-extrabold text-blue-600">
            ₹{service.basePrice}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;