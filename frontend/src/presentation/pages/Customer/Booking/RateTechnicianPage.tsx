import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, CheckCircle2 } from 'lucide-react';
import api from '../../../../infrastructure/api/axiosClient';
import { useNotification } from '../../../hooks/useNotification';
import Navbar from '../../../../presentation/components/Customer/Layout/Navbar';

const RateTechnicianPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
        showError("Please select a star rating.");
        return;
    }

    setSubmitting(true);
    try {
        await api.post(`/bookings/${id}/rate`, {
            rating,
            comment
        });
        
        showSuccess("Thank you for your feedback!");
        navigate('/booking/history');  
    } catch (err: unknown) {
  const msg =
    err instanceof Error
      ? err.message
      : "Failed to submit rating";

  showError(msg);
}
finally {
        setSubmitting(false);
    }
  };

  const handleSkip = () => {
      navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="max-w-md mx-auto px-6 pt-12 text-center">
        
        {/* Success Animation */}
        <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce shadow-green-200 shadow-lg">
                <CheckCircle2 size={40} className="text-green-600" />
            </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-8">Your job is completed. Please rate the technician.</p>

        {/* Rating Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Rate your experience</p>
            
            {/* Stars */}
            <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                    >
                        <Star 
                            size={36} 
                            className={`${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} transition-colors`} 
                            strokeWidth={star <= rating ? 0 : 2}
                        />
                    </button>
                ))}
            </div>

            {/* Comment */}
            <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                rows={4}
                placeholder="Write a comment (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />

            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-all active:scale-[0.98]"
            >
                {submitting ? "Submitting..." : "Submit Review"}
            </button>
            
            <button 
                onClick={handleSkip}
                className="mt-4 text-sm text-gray-400 font-semibold hover:text-gray-600"
            >
                Skip Feedback
            </button>
        </div>
      </div>
    </div>
  );
};

export default RateTechnicianPage;