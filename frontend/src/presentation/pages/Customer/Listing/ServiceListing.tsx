import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Loader2, Filter } from 'lucide-react'; // Removed Star, ArrowRight as they are in Card now

// Components
import Navbar from '../../../components/Customer/Layout/Navbar';
import BottomNav from '../../../components/Customer/Layout/BottomNav';
import Footer from '../../../components/Customer/Layout/Footer';
import LoaderFallback from '../../../components/LoaderFallback';

// *** IMPORT THE NEW CARD COMPONENT ***
import ServiceCard from '../../../components/Customer/Services/ServiceCard';

// Repos
import * as serviceRepo from '../../../../infrastructure/repositories/customer/serviceRepository';
import * as homeRepo from '../../../../infrastructure/repositories/customer/homeRepository';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';
import type { ServiceCategory } from '../../../../domain/types/ServiceCategory';

const ITEMS_PER_PAGE = 8;

const ServiceListing: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE ---
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // URL Params
  const activeCategoryId = searchParams.get('categoryId') || '';
  const activeSearch = searchParams.get('search') || '';
  const activeSort = searchParams.get('sort') || 'popular';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- 1. FETCH CATEGORIES ---
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await homeRepo.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCats();
  }, []);

  // --- 2. FETCH SERVICES ---
  useEffect(() => {
    const fetchServices = async () => {
      if (page === 1) setInitialLoading(true);
      else setLoadingMore(true);

      try {
        const data = await serviceRepo.getServices({
          categoryId: activeCategoryId || undefined,
          search: activeSearch,
          sortBy: activeSort as any,
          page: page,
          limit: ITEMS_PER_PAGE
        });

        if (page === 1) {
          setServices(data);
        } else {
          setServices(prev => [...prev, ...data]);
        }
        setHasMore(data.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    };
    fetchServices();
  }, [activeCategoryId, activeSearch, activeSort, page]);

  // --- 3. HANDLERS ---
  const updateFilter = (key: string, value: string) => {
    setPage(1);
    setServices([]);
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
  };

  const clearAllFilters = () => {
    setPage(1);
    setSearchParams({});
  };

  const handleLoadMore = () => setPage(prev => prev + 1);

  const visibleCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(activeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-[1400px] mx-auto w-full p-4 md:p-6 pb-24">

        {/* HEADER SECTION */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-h-[24px] flex items-center">
              {activeSearch && (
                <p className="text-gray-500 text-sm animate-fadeIn">
                  Results for <span className="font-semibold text-gray-900">"{activeSearch}"</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-48 group">
                <select
                  value={activeSort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className=" w-full appearance-none bg-white h-10 pl-4 pr-10 rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-700 cursor-pointer outline-none transition-all hover:border-gray-300focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option value="popular">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>

                {/* Icon */}
                <Filter className=" pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>


              {(activeCategoryId || activeSearch || activeSort !== 'popular') && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-red-100 whitespace-nowrap"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="w-full overflow-hidden border-b border-gray-100 pb-1">
            <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide snap-x scroll-pl-1">
              <button
                onClick={() => updateFilter('categoryId', '')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 snap-start select-none border ${!activeCategoryId ? 'bg-blue-500 text-white ' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                All Services
              </button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateFilter('categoryId', cat._id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 snap-start select-none border ${activeCategoryId === cat._id ? 'bg-blue-500 text-white ' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRID AREA */}
        {initialLoading && services.length === 0 ? (
          <div className="py-32 flex justify-center"><LoaderFallback /></div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mx-auto max-w-lg">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No services found</h3>
            <p className="text-gray-500 mt-2 px-6">We couldn't find anything matching your filters.</p>
            <button onClick={clearAllFilters} className="mt-6 text-blue-600 font-semibold hover:text-blue-700 hover:underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mb-12">
              {services.map(service => (
                // Use the new component here
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pb-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-full font-semibold shadow-sm hover:shadow-md hover:border-blue-200 hover:text-blue-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Show More Services</span>}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default ServiceListing;