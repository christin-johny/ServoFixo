import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldCheck, Lock, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { RootState } from '../../../../store/store';
import { useNotification } from '../../../notifications/hooks/useNotification';
import Navbar from '../../../../layouts/customer/Navbar';
import { getBookingById } from '../../api/customerBookingRepository';
import api from '../../../../lib/axiosClient';
import { setActiveBooking } from '../../../../store/customerSlice';

// --- 1. STRICT RAZORPAY TYPES ---

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorDetail {
  description: string;
  code: string;
  reason: string;
  step: string;
  source: string;
  metadata: Record<string, unknown>;
}

interface RazorpayErrorResponse {
    error: RazorpayErrorDetail;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  //   STRICTLY TYPED MODAL HANDLER
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
}

// Extend Window interface globally
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// --- 2. STRICT BOOKING DATA TYPES ---

interface ExtraChargeItem {
  id: string;
  title: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface BookingPricing {
    estimated: number;
    deliveryFee: number;
    final?: number;
}

interface PaymentInfo {
    razorpayOrderId?: string;
    amount: number;
    status: string;
}

interface CustomerSnapshot {
    phone?: string;
}

interface PaymentPageBookingData {
  id: string;
  status: string;
  pricing: BookingPricing;
  payment?: PaymentInfo;
  extraCharges?: ExtraChargeItem[];
  snapshots?: {
    customer?: CustomerSnapshot;
  };
}

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.customer);
  const { showError, showSuccess } = useNotification();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [booking, setBooking] = useState<PaymentPageBookingData | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!id) return;
        const response = await getBookingById(id);
    const data = (response as unknown) as PaymentPageBookingData;
        setBooking(data);
        
        if (data.status === 'PAID') {
            navigate(`/booking/${id}/rate`);
        }
      } catch (error: unknown) {
        console.error(error);
        showError("Failed to load bill details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate, showError]);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!booking || !booking.payment?.razorpayOrderId) {
        showError("Invoice not ready. Please wait.");
        return;
    }

    setProcessing(true);
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      showError('Razorpay SDK failed to load.');
      setProcessing(false);
      return;
    }

    //   STRICTLY TYPED OPTIONS (No 'any')
    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
      amount: booking.payment.amount * 100, 
      currency: "INR",
      name: "ServoFixo Services",
      description: `Payment for Service #${id?.slice(-6)}`,
      order_id: booking.payment.razorpayOrderId, 
      
      //   SUCCESS HANDLER
      handler: async function (response: RazorpayResponse) {
        try {
           if (!id) return;
           
           await api.post(`/bookings/${id}/payment/verify`, {
             razorpay_order_id: response.razorpay_order_id,
             razorpay_payment_id: response.razorpay_payment_id,
             razorpay_signature: response.razorpay_signature
           });
           
           dispatch(setActiveBooking({ id: id, status: 'PAID' }));
           showSuccess("Payment Successful!");
           navigate(`/booking/${id}/rate`);
           
        } catch (error: unknown) {
           console.error("Verification failed", error);
           
           // If backend verification fails, we can check specific error types here if needed
           showError("Payment verification failed. Please check your dashboard.");
           
           // Optional: Navigate to failure page if you want 'Hard Failure' handling
           // navigate(`/booking/${id}/payment/failed`, { state: { amount: booking.payment.amount } });
        }
      },
      
      //   USER CANCELLATION HANDLER (Correctly Typed)
      modal: {
        ondismiss: function () {
            showError("Payment Cancelled");
            setProcessing(false);
        }
      },

      prefill: {
        name: profile?.name || "Customer",
        email: profile?.email || "",
        contact: booking?.snapshots?.customer?.phone || ""
      },
      theme: {
        color: "#2563EB"
      }
    };

    const rzp = new window.Razorpay(options);
    
    //   BANK FAILURE HANDLER (Strictly Typed)
    rzp.on('payment.failed', function (response: RazorpayErrorResponse) {
        console.error("Payment Failed:", response.error);
        showError(response.error.description || "Transaction Declined");
        setProcessing(false); 
    });
    
    rzp.open();
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Invoice...</div>;

  const pricing = booking?.pricing || { estimated: 0, deliveryFee: 0 };
  
  //   Removed implicit 'any' on map
  const extras = booking?.extraCharges?.filter((c: ExtraChargeItem) => c.status === 'APPROVED') || [];
  const finalAmount = pricing.final || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 pt-8">
        
        {/* Invoice Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest relative z-10">Total Amount Due</p>
                <h1 className="text-5xl font-black text-white mt-3 tracking-tight relative z-10">
                    ₹{finalAmount}
                </h1>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-gray-300 backdrop-blur-md relative z-10">
                    <Lock size={12} /> Secure 256-bit SSL Payment
                </div>
            </div>

            <div className="p-8">
                <h3 className="font-bold text-gray-900 mb-6">Bill Breakdown</h3>
                
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Service Charge</span>
                        <span className="font-medium text-gray-900">₹{pricing.estimated}</span>
                    </div>
                    {pricing.deliveryFee > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>Convenience Fee</span>
                            <span className="font-medium text-gray-900">₹{pricing.deliveryFee}</span>
                        </div>
                    )}
                </div>

                {extras.length > 0 && (
                    <div className="py-4 border-t border-dashed border-gray-200">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Additional Items</p>
                        <div className="space-y-3">
                            {/*   'extra' is now inferred correctly as ExtraChargeItem */}
                            {extras.map((extra) => (
                                <div key={extra.id} className="flex justify-between text-gray-600 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-green-500" />
                                        <span>{extra.title}</span>
                                    </div>
                                    <span className="font-medium text-gray-900">₹{extra.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-lg text-gray-900">Grand Total</span>
                    <span className="font-black text-2xl text-blue-600">₹{finalAmount}</span>
                </div>
            </div>
        </div>

        {/* Payment Button */}
        <button 
            onClick={handlePayment}
            disabled={processing}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
            {processing ? (
                <span>Processing Securely...</span>
            ) : (
                <>
                    <CreditCard className="w-5 h-5" />
                    <span>PAY ₹{finalAmount} NOW</span>
                    <ChevronRight className="w-5 h-5 opacity-60" />
                </>
            )}
        </button>

        <div className="mt-6 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
            <ShieldCheck size={14} /> Payments processed securely via Razorpay
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;