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
    <div
      onClick={() => { navigate(`/services/${service.id}`) }}
      className="min-w-[160px] w-[160px] md:min-w-[210px] md:w-[210px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden shrink-0 group cursor-pointer hover:shadow-md transition-all duration-300"
    >
      {/* Reduced height for images to prevent "lengthy" look */}
      <div className="h-24 md:h-32 bg-gray-50 relative overflow-hidden">
        <img
          src={service.imageUrls[0] || '/assets/service-placeholder.png'}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-sm">
          <Star size={8} className="text-yellow-400 fill-yellow-400" /> {service.rating || 0}
        </div>
      </div>

      {/* Tightened Padding Section */}
      <div className="p-3 flex flex-col justify-between h-[100px]">
        <div>
          <h4 className="text-[13px] md:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {service.name}
          </h4>
          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-tight">
            {service.description}
          </p>
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xs font-medium text-gray-400">Starts at</span>
          <span className="text-sm md:text-base font-black text-gray-900">₹{service.basePrice}</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;