import React from 'react';
import PopularServiceCard from './PopularServiceCard';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props { services: ServiceItem[]; }

const PopularCarousel: React.FC<Props> = ({ services }) => {
  const navigate = useNavigate()
  return (
    <section className="relative w-full">
      <div className="flex justify-between items-end mb-6 px-1">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900">Most Booked Services</h3>
        <button className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all" onClick={()=>{navigate('/services')}}>
          See All <ArrowRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
        {services.map(s => (
          <div key={s.id} className="w-full">
            <PopularServiceCard service={s} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularCarousel;