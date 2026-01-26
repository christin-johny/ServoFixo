import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useSelector } from 'react-redux'; // Added useSelector
import { type RootState } from '../../../../store/store'; 
import {
   Star,
   ShieldCheck,
   Share2,
   Heart,
   CheckCircle2,
   MapPin,
} from 'lucide-react';

import Navbar from '../../../components/Customer/Layout/Navbar';
import Footer from '../../../components/Customer/Layout/Footer';
import BottomNav from '../../../components/Customer/Layout/BottomNav';
import LoaderFallback from '../../../components/LoaderFallback';
import ServiceCard from '../../../components/Customer/Home/ServiceCard';
import { useNotification } from "../../../hooks/useNotification";

import * as serviceRepo from '../../../../infrastructure/repositories/customer/serviceRepository';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';

const MOCK_REVIEWS = [
   {
      id: 1,
      name: "Arjun Mehta",
      date: "2 days ago",
      rating: 5,
      comment: "Absolutely brilliant service! The technician arrived exactly on time.",
   },
];

const ServiceDetails: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const { showSuccess } = useNotification();
   const { user } = useSelector((state: RootState) => state.auth);
   const [service, setService] = useState<ServiceItem | null>(null);
   const [similarServices, setSimilarServices] = useState<ServiceItem[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      window.scrollTo(0, 0);
      const fetchData = async () => {
         setLoading(true);
         try {
            if (!id) return;
            const data = await serviceRepo.getServiceById(id);
            setService(data);
            const services = await serviceRepo.getServices({categoryId: data.categoryId});
            setSimilarServices(services.filter(s=>s.id !== id));
         } catch (err) {
            console.error("Failed to load service", err);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [id]);

   const handleBookNow = () => {
      if (!service || !id) return;

      // 1. Auth Check
      if (!user) {
         // If not logged in, force login (and maybe redirect back later)
         navigate('/login'); 
         return;
      }
 
      navigate('/booking/confirm', { 
         state: { 
            serviceId: id, 
            serviceName: service.name, 
            basePrice: service.basePrice 
         } 
      });
   };

   const handleShare = async () => {
      const shareUrl = window.location.href;
      const shareData = {
         title: 'Check out this service!',
         text: `I found this great service on Servofixo: ${service?.name || 'Service'}`,
         url: shareUrl,
      };

      if (navigator.share) {
         try { await navigator.share(shareData); return; } catch  { return; }
      }
      try {
         await navigator.clipboard.writeText(shareUrl);
         showSuccess("Link copied to clipboard!");
      } catch {
         prompt("Copy this link:", shareUrl);
      }
   };

   if (loading) return <LoaderFallback />;
   if (!service) return <div className="p-10 text-center">Service not found.</div>;

   const displayPrice = service.basePrice;
   const images = service.imageUrls?.length > 0 ? service.imageUrls : ['https://via.placeholder.com/800x600'];

   return (
      <div className="min-h-screen bg-white font-sans text-gray-900">

         <div className="sticky top-0 z-50 ">
            <Navbar />

            {/* MOBILE SHARE BAR (Inside sticky container) */}
            <div className="md:hidden border-t flex justify-end items-center p-3 px-4 ">
               <div className="flex gap-4">
                  {/* Transparent Share Button */}
                  <button onClick={handleShare} className="active:scale-90 transition-transform p-1">
                     <Share2 size={24} className="text-gray-700 " />
                  </button>
                  {/* Transparent Heart Button */}
                  <button className="active:scale-90 transition-transform p-1">
                     <Heart size={24} className="text-gray-700" />
                  </button>
               </div>
            </div>
         </div>

         {/* --- MAIN CONTENT --- */}
         <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-0 pb-48 md:pb-10 md:pt-6" >

            {/* IMAGE GALLERY */}
            <div className="relative w-full md:rounded-2xl overflow-hidden mb-8 bg-gray-100">
               <div className="flex md:grid md:grid-cols-4 md:grid-rows-2 gap-0.5 md:gap-2 overflow-x-auto md:overflow-hidden snap-x snap-mandatory scrollbar-hide h-[320px] md:h-[450px]">

                  {/* Main Image */}
                  <div className="min-w-full md:min-w-0 md:col-span-2 md:row-span-2 relative snap-center">
                     <img src={images[0]} alt="Main" className="w-full h-full object-cover" />
                  </div>

                  {/* Other Images */}
                  {[1, 2, 3, 4].map((idx) => (
                     <div key={idx} className={`${idx > 0 ? 'min-w-full md:min-w-0' : ''} md:block relative overflow-hidden snap-center`}>
                        {/* Mobile View */}
                        <div className="md:hidden block w-full h-full">
                           <img src={images[idx] || images[0]} alt={`Mobile View ${idx}`} className="w-full h-full object-cover" />
                        </div>
                        {/* Desktop Grid View */}
                        <div className="hidden md:block w-full h-full">
                           {idx === 4 ? (
                              <div className="relative w-full h-full">
                                 <img src={images[idx] || images[0]} alt={`Side ${idx}`} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                                 {images.length > 5 && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg hover:bg-black/50 cursor-pointer">
                                       +{images.length - 5}
                                    </div>
                                 )}
                              </div>
                           ) : (
                              <img src={images[idx] || images[0]} alt={`Side ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                           )}
                        </div>
                     </div>
                  ))}
               </div>

               {/* Mobile Swipe Hint */}
               <div className="absolute bottom-4 right-4 md:hidden bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white font-medium flex items-center gap-2">
                  <span className="opacity-70 text-[10px] uppercase tracking-wide border-l border-white/30 pl-2">Swipe &rarr;</span>
               </div>
            </div>

            {/* TEXT CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-0 md:px-0">
               <div className="md:col-span-2 space-y-8 px-4 md:px-0">

                  {/* Title */}
                  <div className="border-b border-gray-100 pb-6">
                     <div className="flex justify-between items-start">
                        <div>
                           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 break-words leading-tight">{service.name}</h1>
                           <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                 <span className="font-bold text-gray-900">4.8</span>
                                 <span className="underline ml-1 text-xs">(124 reviews)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                 <MapPin size={16} /> <span>Bengaluru</span>
                              </div>
                           </div>
                        </div>
                        <div className="hidden md:flex gap-2 shrink-0">
                           <button onClick={handleShare} className="p-2.5 hover:bg-gray-100 rounded-full border border-gray-200 text-gray-600 hover:text-blue-600 transition-colors">
                              <Share2 size={20} />
                           </button>
                           <button className="p-2.5 hover:bg-gray-100 rounded-full border border-gray-200 text-gray-600 hover:text-red-500 transition-colors">
                              <Heart size={20} />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Highlights */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                     <h3 className="font-bold text-lg mb-4">Highlights</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.specifications?.map((spec, idx) => (
                           <div key={idx} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700 break-words">
                                 <span className="font-semibold">{spec.title}: </span> {spec.value}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                     <h3 className="font-bold text-xl">About this service</h3>
                     <div className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px] break-words">
                        {service.description}
                     </div>
                  </div>

                  {/* Reviews */}
                  <div className="pt-8 border-t border-gray-100">
                     <h3 className="font-bold text-xl mb-6">Customer Reviews</h3>
                     {MOCK_REVIEWS.map((review) => (
                        <div key={review.id} className="flex gap-4 mb-6">
                           <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 shrink-0">
                              {review.name.charAt(0)}
                           </div>
                           <div>
                              <div className="font-bold text-gray-900">{review.name}</div>
                              <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Desktop Booking Widget */}
               <div className="hidden md:block relative">
                  <div className="sticky top-24 border border-gray-200 shadow-lg rounded-2xl p-6 bg-white">
                     <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-1">Total Price</p>
                        <p className="text-4xl font-bold text-gray-900">₹{displayPrice}</p>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 mb-6">
                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">Secure Payment</span>
                     </div>
                     <button 
            onClick={handleBookNow} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98]"
        >
            Book Now
        </button>
                  </div>
               </div>
            </div>

            {similarServices.length > 0 && (
    <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6 px-4 md:px-0">Similar Services</h2>

        <div 
            className="flex space-x-1 md:space-x-2 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
            style={{ WebkitOverflowScrolling: 'touch' }} 
        >
            {similarServices.map((s, index) => (
                <div 
                    key={s.id} 
                    className={`
                        snap-center 
                        flex-shrink-0 
                        w-[75vw] sm:w-[50vw] md:w-1/4 
                        ${index === 0 ? 'pl-4' : ''}  
                        ${index === similarServices.length - 1 ? 'pr-4' : ''} 
                    `}
                >
                    <ServiceCard service={s} />
                </div>
            ))}
        </div>

    </section>
)}
         </div>

         <div className="fixed bottom-[60px] left-0 w-full bg-white border-t border-gray-100 p-4 md:hidden z-40 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div>
               <span className="text-xs text-gray-500 font-medium block">Total Price</span>
               <span className="text-xl font-bold text-gray-900">₹{displayPrice}</span>
            </div>
            <button 
        onClick={handleBookNow}
        className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95"
    >
        Book Now
    </button>
         </div>

         <div className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-white">
            <BottomNav />
         </div>

         <div className="hidden md:block">
            <Footer />
         </div>
      </div>
   );
};

export default ServiceDetails;