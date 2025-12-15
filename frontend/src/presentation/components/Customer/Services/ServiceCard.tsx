import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';

interface ServiceCardProps {
  service: ServiceItem & { rating?: number; reviewCount?: number | string };
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();

  const displayImage = service.imageUrls?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';
  const displayPrice = service.basePrice;
  const displayRating = service.rating?.toFixed(1) || '4.8';
  const displayReviewCount = service.reviewCount ?? '1k';

  return (
    <article
      onClick={() => navigate(`/services/${service._id}`)}
      className="
group relative flex flex-col w-full h-full
 bg-white rounded-xl
border border-gray-100
transition-all duration-300
hover:shadow-xl hover:-translate-y-1 hover:border-transparent
overflow-hidden
cursor-pointer
"
      role="button"
      aria-label={service.name}
    >
      {/* Image Area: h-32 on mobile, h-52 on larger screens */}
      <div className="relative h-32 sm:h-40 bg-gray-100 overflow-hidden">
        <img
          src={displayImage}
          alt={service.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Content Area: Uses flex-grow for equal height */}
      <div className="flex flex-col flex-grow p-3 sm:p-4">

        {/* Title */}
        <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
          {service.name}
        </h4>

        {/* Rating Row (from PopularCard) */}
        <div className="flex items-center gap-1.5 mt-1 mb-2">
          <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded text-green-700">
            <Star size={10} className="fill-current text-green-700" />
            <span className="text-[10px] sm:text-xs font-bold">{displayRating}</span>
          </div>
          <span className="text-[10px] sm:text-xs text-gray-400">
            ({displayReviewCount})
          </span>
        </div>

        {/* Description (from original ServiceCard) - Removed line-clamp-2 to prevent height variation */}
        {/* NOTE: If you need to enforce height consistency, remove or reduce the description. */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {service.description || "No description available."}
        </p>

        {/* Price Section & Button - Pushed to bottom of card (mt-auto) */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium">Starts at</span>
            <span className="text-base font-bold text-gray-900">
              ₹{displayPrice}
            </span>
          </div>

          {/* Action Button */}
          <button className="
bg-blue-50 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center 
group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 
shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;