import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import ServiceCard from './ServiceDetailsCard';
import * as homeRepo from '../../../dashboard/api/homeRepository';
import type { ServiceCategory } from '../../../../features/service-catalog/types/ServiceCategory';
import type { ServiceItem } from '../../../../features/service-catalog/types/ServiceItem';
import { useNavigate } from 'react-router-dom';

interface CategoryRowProps {
  category: ServiceCategory;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ category }) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true;
    const fetchServices = async () => {
      try {
        const data = await homeRepo.getServicesByCategory(category.id);
        if (mounted) setServices(data);
      } catch (err) {
        console.error(`Failed to load services for ${category.name}`, err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchServices();
    return () => { mounted = false; };
  }, [category.id]);
 
  if (!loading && services.length === 0) return null;

  return (
    <section id={category.id} className="w-full scroll-mt-28 mb-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
          {category.name}
        </h3>
        
        <button 
          className="text-xs sm:text-sm font-bold text-blue-600 flex items-center gap-1 hover:pr-2 transition-all"
          onClick={() => { navigate(`/services?categoryId=${category.id}`) }}
        >
          View All <ArrowRight size={14} />
        </button>
      </div>
 
      <div className="
        flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 
        snap-x snap-mandatory scrollbar-hide 
        -mx-4 px-4 md:mx-0 md:px-0
      ">
        {loading 
          ? [1,2,3,4,5].map(i => (
              <div key={i} className="min-w-[160px] sm:min-w-[200px] h-[220px] bg-gray-100 animate-pulse rounded-xl" />
            ))
          : services.map((service) => (
              <div key={service.id} className="snap-start">
                <ServiceCard service={service} />
              </div>
            ))
        }
      </div>
    </section>
  );
};

export default CategoryRow;