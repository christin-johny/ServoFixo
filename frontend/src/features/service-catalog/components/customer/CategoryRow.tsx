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

// CategoryRow.tsx

return (
  <section id={category.id} className="w-full scroll-mt-28 mb-12">
    {/* Header Section */}
    <div className="flex justify-between items-center mb-6 px-1">
      <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
        {category.name}
      </h3>
      
      <button 
        className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group"
        onClick={() => { navigate(`/services?categoryId=${category.id}`) }}
      >
        View All 
        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    {/* Responsive Grid: 2 columns on mobile, 3 on small desktop, 4 on large desktop */}
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {loading 
        ? [1, 2, 3, 4].map(i => (
            <div key={i} className="w-full h-64 bg-gray-100 animate-pulse rounded-2xl" />
          ))
        : services.slice(0, 4).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))
      }
    </div>
  </section>
);
};

export default CategoryRow;