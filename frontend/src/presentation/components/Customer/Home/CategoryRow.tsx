import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import ServiceCard from './ServiceCard';
import * as homeRepo from '../../../../infrastructure/repositories/customer/homeRepository';
import type { ServiceCategory } from '../../../../domain/types/ServiceCategory';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';

interface CategoryRowProps {
  category: ServiceCategory;
  setRef?: (el: HTMLDivElement | null) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ category, setRef }) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchServices = async () => {
      try {
        const data = await homeRepo.getServicesByCategory(category._id);
        if (mounted) setServices(data);
      } catch (err) {
        console.error(`Failed to load services for ${category.name}`, err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchServices();
    return () => { mounted = false; };
  }, [category._id]);

  // Hide section if no services exist
  if (!loading && services.length === 0) return null;

  return (
    <section ref={setRef} className="scroll-mt-40">
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900">{category.name}</h3>
        <button className="text-xs md:text-sm font-bold text-blue-600 flex items-center gap-0.5 hover:gap-2 transition-all">
          See All <ArrowRight size={14} />
        </button>
      </div>

      {/* List */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {loading 
          ? [1,2,3].map(i => <div key={i} className="min-w-[200px] h-60 bg-gray-100 rounded-xl animate-pulse"/>)
          : services.map(s => <ServiceCard key={s._id} service={s} />)
        }
      </div>
    </section>
  );
};

export default CategoryRow;