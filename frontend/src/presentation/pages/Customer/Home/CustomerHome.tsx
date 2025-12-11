import React, { useRef, useEffect, useState } from 'react';
import Navbar from '../../../components/Customer/Navbar';
import BottomNav from '../../../components/Customer/BottomNav';
import Footer from '../../../components/Customer//Footer';
import { Star, ArrowRight,} from 'lucide-react';
import * as homeRepo from '../../../../infrastructure/repositories/customer/homeRepository';
import type { ServiceCategory } from '../../../../domain/types/ServiceCategory';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';

const CustomerHome: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [popularServices, setPopularServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, popular] = await Promise.all([
          homeRepo.getCategories(),
          homeRepo.getPopularServices()
        ]);
        setCategories(cats);
        setPopularServices(popular);
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scrollToSection = (categoryName: string) => {
    const key = categoryName.toLowerCase().replace(/\s+/g, '-');
    const element = sectionRefs.current[key];
    if (element) {
      const yOffset = -180;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    // ✅ Flex-col ensures footer stays at bottom
    <div className="min-h-screen bg-gray-50 flex flex-col p-0">
      <Navbar />

      {/* Main Content: pb-24 for mobile nav, md:pb-0 for desktop */}
      <div className="flex-1 pb-24 md:pb-0">
        
        {/* Sticky Category Strip */}
        <div className="sticky top-[72px] md:top-[80px] z-40 bg-white border-b border-gray-100 shadow-sm py-3 transition-all">
          <div className="flex overflow-x-auto gap-6 px-4 scrollbar-hide justify-start md:justify-center">
            {loading ? (
               [1,2,3,4,5].map(i => <div key={i} className="w-16 h-16 bg-gray-100 rounded-full animate-pulse shrink-0"/>)
            ) : (
              categories.map((cat) => (
                <button 
                  key={cat._id}
                  onClick={() => scrollToSection(cat.name)}
                  className="flex flex-col items-center gap-2 min-w-[64px] group"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 p-3 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                    <img src={cat.iconUrl} alt={cat.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 text-center leading-tight line-clamp-1 group-hover:text-blue-600">
                    {cat.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-8 md:space-y-12">
          
          {/* Hero Banner */}
          <div className="w-full h-44 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl relative overflow-hidden shadow-lg group cursor-pointer">
            {/* ... (Banner Content same as before) ... */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-20"></div>
            <div className="relative z-10 p-6 md:p-10 flex flex-col justify-center h-full text-white">
               <h2 className="text-2xl md:text-4xl font-bold">20% OFF <br/> AC Service</h2>
               <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-bold w-fit text-sm">Book Now</button>
            </div>
          </div>

          {/* Most Booked */}
          <section ref={el => sectionRefs.current['most-booked'] = el} className="scroll-mt-40">
            <SectionHeader title="Most Booked" />
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {popularServices.map((service) => <ServiceCard key={service._id} service={service} />)}
            </div>
          </section>

          {/* Appliances Section */}
          <section ref={el => sectionRefs.current['appliances'] = el} className="scroll-mt-40">
            <SectionHeader title="Appliances Service" />
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
               {popularServices.slice(0,3).map(s => <ServiceCard key={s._id+'app'} service={s} />)}
            </div>
          </section>

        </div>
      </div>
      
      {/* Footer (Desktop Only) */}
      <Footer />

      {/* Bottom Nav (Mobile Only) */}
      <BottomNav />
    </div>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex justify-between items-end mb-4">
    <h3 className="text-lg md:text-2xl font-bold text-gray-900">{title}</h3>
    <button className="text-xs md:text-sm font-bold text-blue-600 flex items-center gap-0.5">See All <ArrowRight size={14} /></button>
  </div>
);

const ServiceCard = ({ service }: { service: ServiceItem }) => (
  <div className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden shrink-0 group cursor-pointer hover:shadow-lg transition-all">
    <div className="h-28 md:h-36 bg-gray-100 relative overflow-hidden">
      <img src={service.imageUrls[0]} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
        <Star size={10} className="text-yellow-500 fill-yellow-500" /> 4.8
      </div>
    </div>
    <div className="p-3 md:p-4">
      <h4 className="text-sm md:text-base font-bold text-gray-900 line-clamp-1">{service.name}</h4>
      <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2 mt-1 h-8">{service.description}</p>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-100">
        <div className="flex flex-col">
           <span className="text-sm md:text-base font-bold text-gray-900">₹{service.basePrice}</span>
        </div>
        <button className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">ADD</button>
      </div>
    </div>
  </div>
);

export default CustomerHome;