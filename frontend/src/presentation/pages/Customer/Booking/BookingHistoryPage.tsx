import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../../../presentation/components/Customer/Layout/Navbar';
import BottomNav from '../../../../presentation/components/Customer/Layout/BottomNav';
import BookingHistoryCard from '../../../../presentation/components/Customer/Booking/BookingHistoryCard';
import { getMyBookings, type BookingResponse } from '../../../../infrastructure/repositories/customer/customerBookingRepository';
import { useNotification } from '../../../hooks/useNotification';

const TABS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  
  // State
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Data
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const result = await getMyBookings({ 
          page, 
          limit: 10, 
          status: activeTab 
        });
        setBookings(result.data);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error(err);
        showError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [page, activeTab]);

  // Handle Tab Change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1); // Reset to first page
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 relative">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate('/profile')} 
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
        </div>

        {/* Filters (Tabs) */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                activeTab === tab.value
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl w-full" />
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingHistoryCard key={booking.id} booking={booking} />
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Filter className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No bookings found</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              You haven't made any bookings in this category yet.
            </p>
            {activeTab !== '' && (
              <button 
                onClick={() => handleTabChange('')}
                className="mt-4 text-blue-600 font-medium text-sm hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default BookingHistoryPage;