import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import ServiceCard from './ServiceCard';
import * as homeRepo from '../../../../infrastructure/repositories/customer/homeRepository';
import type { ServiceCategory } from '../../../../domain/types/ServiceCategory';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';
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
    <section  
      id={category.id}  
      className="w-full scroll-mt-32"
    >
      <div className="flex justify-between items-end mb-5 px-1">
        <div className="flex items-center gap-3">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{category.name}</h3>
        </div>
        
        <button className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all"onClick={()=>{navigate(`/services?categoryId=${category.id}`)}}>
          See All <ArrowRight size={16} />
        </button>
      </div>

      <div className="
        flex gap-4 overflow-x-auto pb-6 pt-2 
        snap-x snap-mandatory 
        scrollbar-hide 
        -mx-4 px-4 md:mx-0 md:px-0
      ">
        {loading 
          ? [1,2,3,4].map(i => (
              <div key={i} className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] h-64 bg-gray-100 rounded-xl animate-pulse shrink-0 snap-start"/>
            ))
          : services.map(s => (
              <div key={s._id} className="snap-start shrink-0">
                 <ServiceCard service={s} />
              </div>
            ))
        }
      </div>
    </section>
  );
};

export default CategoryRow;