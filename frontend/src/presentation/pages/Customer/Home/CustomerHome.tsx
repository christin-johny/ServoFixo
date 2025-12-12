import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // 1. Import Redux hooks
import Navbar from '../../../components/Customer/Layout/Navbar';
import BottomNav from '../../../components/Customer/Layout/BottomNav';
import Footer from '../../../components/Customer/Layout/Footer';
import CategoryRow from '../../../components/Customer/Home/CategoryRow';
import PopularCarousel from '../../../components/Customer/Home/PopularCarousel';
import CategoryCardStrip from '../../../components/Customer/Home/CategoryCardStrip';
import AITroubleshootCard from '../../../components/Customer/Home/AITroubleshootCard';
import * as homeRepo from '../../../../infrastructure/repositories/customer/homeRepository';
import * as customerRepo from '../../../../infrastructure/repositories/customer/customerRepository';
import { type RootState } from '../../../../store/store';
import { fetchProfileStart, fetchProfileSuccess, fetchProfileFailure } from '../../../../store/customerSlice';

import type { ServiceCategory } from '../../../../domain/types/ServiceCategory';
import type { ServiceItem } from '../../../../domain/types/ServiceItem';

const CustomerHome: React.FC = () => {
    const dispatch = useDispatch();
    const { accessToken, user: authUser } = useSelector((state: RootState) => state.auth);
    const { profile } = useSelector((state: RootState) => state.customer);

    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [popularServices, setPopularServices] = useState<ServiceItem[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

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
                setPageLoading(false);
            }
        };
        fetchMasterData();
    }, []);

    useEffect(() => {

        const isCustomer = authUser?.role === 'customer';

        if (accessToken && !profile && isCustomer) {
            const loadProfile = async () => {
                try {
                    dispatch(fetchProfileStart());
                    const data = await customerRepo.getProfile();
                    dispatch(fetchProfileSuccess(data));
                } catch (error) {
                    console.error("Failed to load customer profile", error);
                    dispatch(fetchProfileFailure("Failed to load"));
                }
            };
            loadProfile();
        }
    }, [accessToken, profile, authUser, dispatch]);

    const animateScroll = (targetPosition: number, duration: number = 800) => {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime: number | null = null;

        const animation = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        const ease = (t: number, b: number, c: number, d: number) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        requestAnimationFrame(animation);
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset;
            const headerOffset = 120;
            const finalPosition = offsetPosition - headerOffset;
            animateScroll(finalPosition, 1000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Pass user info to Navbar if needed, or let Navbar connect to Redux itself */}
            <Navbar />

            <div className="flex-1 pb-24 md:pb-12">
                <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-12">

                    

                    <CategoryCardStrip
                        categories={categories}
                        loading={pageLoading}
                        scrollToSection={scrollToSection}
                    />

                    {/* Hero Banner */}
                    <div className="w-full h-48 md:h-72 bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl relative overflow-hidden shadow-xl group cursor-pointer transform transition-all hover:scale-[1.01]">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                        <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center h-full text-white">
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">Expert Services,<br />Right at Home.</h2>
                            <h4 className="text-lg md:text-xl font-medium text-blue-100">Trusted by 2 Million+ Households</h4>
                        </div>
                    </div>

                    <AITroubleshootCard />

                    {popularServices.length > 0 && (
                        <PopularCarousel services={popularServices} />
                    )}

                    <div id="all-categories-list" className="space-y-12">
                        {categories.map((cat) => (
                            <CategoryRow
                                key={cat._id}
                                category={cat}
                            />
                        ))}
                    </div>

                </div>
            </div>

            <Footer />
            <BottomNav />
        </div>
    );
};

export default CustomerHome;