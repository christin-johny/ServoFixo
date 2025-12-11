import React, { useRef, useEffect, useState } from 'react';
import Navbar from '../../../components/Customer/Layout/Navbar';
import BottomNav from '../../../components/Customer/Layout/BottomNav';
import Footer from '../../../components/Customer/Layout/Footer';
import CategoryRow from '../../../components/Customer/Home/CategoryRow'; // Imported
import ServiceCard from '../../../components/Customer/Home/ServiceCard'; // Imported
import { ArrowRight } from 'lucide-react';
import * as homeRepo from '../../../../infrastructure/repositories/customer/homeRepository';
import type { ServiceCategory } from '../../../../domain/types/ServiceCategory';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';

const CustomerHome: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [popularServices, setPopularServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catsData, popData] = await Promise.all([
          homeRepo.getCategories(),
          homeRepo.getPopularServices()
        ]);
        setCategories(catsData);
        setPopularServices(popData);
      } catch (err) {
        console.error("Home data failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMasterData();
  }, []);

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const yOffset = -180; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 pb-24 md:pb-0">
        
        {/* --- 1. CATEGORY STRIP --- */}
        <div className="sticky top-[72px] md:top-[80px] z-40 bg-white border-b border-gray-100 shadow-sm py-3 transition-all">
          <div className="flex overflow-x-auto gap-6 px-4 scrollbar-hide justify-start md:justify-center">
            {loading ? (
               [1,2,3,4,5].map(i => <div key={i} className="w-16 h-16 bg-gray-100 rounded-full animate-pulse shrink-0"/>)
            ) : (
              categories.map((cat) => (
                <button 
                  key={cat._id}
                  onClick={() => scrollToSection(cat._id)}
                  className="flex flex-col items-center gap-2 min-w-[64px] group"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 p-3 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                    <img src={cat.iconUrl || '/assets/category-placeholder.png'} alt={cat.name} className="w-full h-full object-contain" />
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
          
          {/* --- 2. HERO BANNER --- */}
          <div className="w-full h-44 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl relative overflow-hidden shadow-lg group cursor-pointer">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-20"></div>
             <div className="relative z-10 p-6 md:p-10 flex flex-col justify-center h-full text-white">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit mb-2">Launch Offer</span>
                <h2 className="text-2xl md:text-4xl font-bold">Expert Services<br/>at Your Doorstep</h2>
             </div>
          </div>

          {/* --- 3. MOST BOOKED (Manual Render) --- */}
          {popularServices.length > 0 && (
            <section>
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg md:text-2xl font-bold text-gray-900">Most Booked Services</h3>
                <button className="text-xs md:text-sm font-bold text-blue-600 flex items-center gap-0.5 hover:gap-2 transition-all">See All <ArrowRight size={14} /></button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {popularServices.map((service) => <ServiceCard key={service._id} service={service} />)}
              </div>
            </section>
          )}

          {/* --- 4. DYNAMIC CATEGORY ROWS --- */}
          {categories.map((cat) => (
            <CategoryRow 
              key={cat._id} 
              category={cat} 
              setRef={(el) => sectionRefs.current[cat._id] = el}
            />
          ))}

        </div>
      </div>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default CustomerHome;