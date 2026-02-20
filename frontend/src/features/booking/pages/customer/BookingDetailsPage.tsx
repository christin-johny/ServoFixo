import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,   User, CheckCircle, 
  Download, Star,  Phone, Clock 
} from 'lucide-react';
import Navbar from '../../../../layouts/customer/Navbar';
import { getBookingById, type BookingResponse } from '../../api/customerBookingRepository';
import { useNotification } from '../../../notifications/hooks/useNotification';
import LoaderFallback from '../../../../components/LoaderFallback';

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useNotification();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const data = await getBookingById(id);
        setBooking(data);
      } catch (err) {
        console.error(err);
        showError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) return <LoaderFallback />;
  if (!booking) return <div className="text-center pt-20">Booking not found</div>;

  const isPaid = booking.status === 'PAID';
  const tech = booking.snapshots?.technician;
  const service = booking.snapshots?.service;
  const pricing = booking.pricing;
  
  // Invoice Calculations
  const basePrice = pricing?.estimated || 0;
  const finalPrice = pricing?.final || basePrice;
  // Assuming a standard platform fee or tax if not explicitly in backend yet
  const platformFee = 0; 
  const total = finalPrice + platformFee;

  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 print:bg-white print:pb-0">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 print:max-w-none print:pt-0 print:px-0">
        
        {/* Header - Hidden in Print */}
        <div className="flex items-center gap-3 mb-6 print:hidden">
          <button 
            onClick={() => navigate('/booking/history')} 
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Booking Details</h1>
        </div>

        {/* --- MAIN INVOICE CARD --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          
          {/* Status Banner */}
          <div className={`px-6 py-4 flex justify-between items-center ${
            isPaid ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'
          } print:bg-white print:text-black print:border-b`}>
            <div className="flex items-center gap-2">
              {isPaid ? <CheckCircle size={20} /> : <Clock size={20} />}
              <span className="font-bold uppercase tracking-wide text-sm">
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <span className="text-xs font-medium opacity-80">
              ID: #{booking.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="p-6">
            {/* Service & Date */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{service?.name}</h2> 
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(booking.timestamps?.scheduledAt || booking.timestamps?.createdAt || '').toDateString()}
                </p>
                <p className="text-sm text-gray-500 mt-2">Time</p>
                <p className="font-medium text-gray-900">
                  {new Date(booking.timestamps?.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 my-6"></div>

            {/* Technician Info */}
            {tech && (
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                   {tech.avatarUrl ? (
                     <img src={tech.avatarUrl} alt={tech.name} className="w-full h-full object-cover"/>
                   ) : (
                     <User className="text-gray-400" />
                   )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service provided by</p>
                  <p className="font-semibold text-gray-900">{tech.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Phone size={12} /> {tech.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Bill Details */}
            <div className="bg-gray-50 rounded-xl p-5 print:bg-white print:border print:border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Base Charge</span>
                  <span>₹{basePrice}</span>
                </div>
                {/* Add logic here if you have extra charges in the future */}
                {platformFee > 0 && (
                   <div className="flex justify-between text-gray-600">
                     <span>Platform Fee</span>
                     <span>₹{platformFee}</span>
                   </div>
                )}
                
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-bold text-lg text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {booking.payment?.razorpayPaymentId && (
                 <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{booking.payment.razorpayPaymentId}</span>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* --- ACTION BUTTONS (Hidden in Print) --- */}
        <div className="mt-6 flex flex-col gap-3 print:hidden">
          
          {/* Rate Button */}
          {isPaid && (
            booking.isRated ? ( 
              <div className="w-full bg-gray-100 text-gray-500 font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-default">
                 <Star className="fill-gray-400 text-gray-400" size={18} />
                 You have rated this service
              </div>
            ) : ( 
              <button
                onClick={() => navigate(`/booking/${id}/rate`)}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Star className="fill-black" size={18} />
                Rate Technician
              </button>
            )
          )}

          {/* Download Invoice Button */}
          {isPaid && (
            <button 
              onClick={handlePrintInvoice}
              className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download Invoice
            </button>
          )}

          {/* Pay Button (If completed but not paid) */}
          {booking.status === 'COMPLETED' && (
             <button
               onClick={() => navigate(`/booking/${id}/payment`)}
               className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
             >
               Pay Now (₹{total})
             </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default BookingDetailsPage;