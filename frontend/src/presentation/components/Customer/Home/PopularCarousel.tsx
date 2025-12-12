import React from 'react';
import PopularServiceCard from './PopularServiceCard';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';

interface Props { services: ServiceItem[]; }

const PopularCarousel: React.FC<Props> = ({ services }) => {
  return (
    <section className="relative w-full">
      <div className="flex justify-between items-end mb-6 px-1">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900">Most Booked Services</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          See All
        </button>
      </div>   
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
        {services.map(s => (
          <div key={s._id} className="w-full">
            <PopularServiceCard service={s} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularCarousel;