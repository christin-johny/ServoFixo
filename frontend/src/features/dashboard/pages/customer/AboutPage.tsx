import React from 'react';
import Navbar from '../../../../layouts/customer/Navbar';
import BottomNav from '../../../../layouts/customer/BottomNav';
import Footer from '../../../../layouts/customer/Footer';
import { ShieldCheck,   Zap,  Award, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            {/* Main Content Wrapper - Matches Home Page Spacing */}
            <div className="flex-1 pb-24 md:pb-12">
                <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-16 mt-8">
                    
                    {/* Catchy Hero Banner - Consistent with Home Hero Style */}
                    <div className="w-full py-12 md:py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 rounded-3xl relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                        <div className="relative z-10 px-8 md:px-16 text-center md:text-left max-w-4xl">
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                                We're not just fixing things. <br />
                                <span className="text-blue-300">We're fixing the way </span> <br />
                                things are fixed.
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100 font-medium max-w-2xl leading-relaxed">
                                Servofixo was built on a simple promise: Every household deserves professional, transparent, and joyful service at a single tap.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid - Catchy & Visual */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {[
                            { label: "Happy Households", value: "2M+" },
                            { label: "Verified Experts", value: "50k+" },
                            { label: "Service Categories", value: "100+" },
                            { label: "City Presence", value: "40+" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center transform transition-all hover:scale-105">
                                <h3 className="text-3xl font-black text-blue-600 mb-1">{stat.value}</h3>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Content Section: The "Why" */}
                    <div className="grid md:grid-cols-2 gap-12 items-center px-2">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                                Your peace of mind is <br /> our main product.
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Finding a reliable technician used to be a gamble. We changed that. 
                                By combining cutting-edge AI diagnostics with a network of hand-picked experts, 
                                <strong> Servofixo</strong> ensures you never have to worry about quality, 
                                pricing, or safety again.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Rigorous 5-step background verification",
                                    "Standardized upfront pricing - no surprises",
                                    "Post-service warranty on every job",
                                    "24/7 Premium customer support"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-bold text-gray-700">
                                        <CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-100 rounded-3xl -rotate-2"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                className="relative rounded-2xl shadow-xl w-full h-[400px] object-cover" 
                                alt="Service professional"
                            />
                        </div>
                    </div>

                    {/* Catchy Value Cards Section */}
                    <div className="space-y-8 py-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-gray-900">The Servofixo Standard</h2>
                            <p className="text-gray-500 font-medium">Why millions choose us over the local alternative</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Hyper-Local Speed",
                                    desc: "Our smart-routing gets a professional to your door in as little as 60 minutes.",
                                    icon: <Zap className="text-yellow-500" />
                                },
                                {
                                    title: "Verified Excellence",
                                    desc: "Only the top 1% of service providers make it through our skill testing.",
                                    icon: <Award className="text-blue-500" />
                                },
                                {
                                    title: "Safety First",
                                    desc: "Every service is insured up to ₹10,000 for total stress-free booking.",
                                    icon: <ShieldCheck className="text-green-500" />
                                }
                            ].map((card, i) => (
                                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                                        {React.cloneElement(card.icon as React.ReactElement, { size: 28 })}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-medium">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Catchy CTA Banner */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-16 text-center space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
                        <h2 className="text-3xl md:text-5xl font-black text-white relative z-10">
                            Ready to experience <br /> the new standard?
                        </h2>
                        <button 
                            onClick={() => navigate('/services')}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-4 rounded-2xl shadow-xl transition-all hover:scale-105 relative z-10"
                        >
                            Book Your First Service
                        </button>
                    </div>

                </div>
            </div>

            <Footer />
            <BottomNav />
        </div>
    );
};

export default AboutPage;