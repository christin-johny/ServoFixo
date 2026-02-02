import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import Navbar from '../../../../presentation/components/Customer/Layout/Navbar';

const PaymentFailedPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve amount passed from the previous screen (optional UI enhancement)
  const amount = location.state?.amount || 0;

  const handleRetry = () => {
    // Navigate back to the Payment Page to restart the process
    navigate(`/booking/${id}/payment`);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="max-w-md mx-auto px-6 pt-16 text-center animate-fade-in-up">
        
        {/* Failure Animation/Icon */}
        <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center shadow-red-200 shadow-xl">
                <XCircle size={48} className="text-red-600" />
            </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3">Payment Failed</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
            We couldn't process your payment. This might be due to a network issue or a declined transaction.
        </p>

        {/* Error Details Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 text-left">
            <div className="flex items-start gap-3">
                <ShieldAlert className="text-red-500 shrink-0 mt-1" size={20} />
                <div>
                    <p className="text-sm font-bold text-gray-900">Transaction Declined</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Don't worry, no money has been deducted. Please check your internet connection or try a different payment method.
                    </p>
                </div>
            </div>
            {amount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase">Amount Pending</span>
                    <span className="text-lg font-black text-gray-900">₹{amount}</span>
                </div>
            )}
        </div>

        {/* Action Buttons */}
        <button 
            onClick={handleRetry}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mb-4"
        >
            <RefreshCw size={20} /> Retry Payment
        </button>
        
        <button 
            onClick={handleGoHome}
            className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
            <ArrowLeft size={20} /> Cancel & Go Home
        </button>

      </div>
    </div>
  );
};

export default PaymentFailedPage;