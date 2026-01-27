import React from "react";
import { Bike, ChevronRight, Map as MapIcon, PlusCircle,   Lock } from "lucide-react";

interface JobFooterProps {
  status: string;
  loading: boolean;
  onEnRoute: () => void;
  onReached: () => void;
  onStart: () => void;
  onExtras: () => void;
  onComplete: () => void;
}

export const JobFooter: React.FC<JobFooterProps> = ({ 
  status, loading, onEnRoute, onReached, onStart, onExtras, onComplete 
}) => {
  
  // Logic: Show footer controls for both normal work AND when waiting for extras approval
  const isWorking = status === "IN_PROGRESS";
  const isPendingExtras = status === "EXTRAS_PENDING";
  const showControls = isWorking || isPendingExtras;

  return (
    <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-[40] md:pl-64 transition-all duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* --- TRAVEL STATUSES --- */}
        {status === "ACCEPTED" && (
          <button onClick={onEnRoute} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] flex items-center justify-center gap-3 group">
            {loading ? "Starting..." : <><Bike className="w-6 h-6 group-hover:translate-x-1 transition-transform" /> Start Travel </>}
          </button>
        )}
        {status === "EN_ROUTE" && (
          <button onClick={onReached} disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] flex items-center justify-center gap-3">
            {loading ? 'Updating...' : <><MapIcon className="w-5 h-5" /> Confirm Arrival at Location</>}
          </button>
        )}
        {status === "REACHED" && (
          <button onClick={onStart} disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 active:scale-[0.98] flex items-center justify-center gap-2">
            {loading ? 'Verifying...' : <>Verify & Start Job <ChevronRight className="w-5 h-5 opacity-80" /></>}
          </button>
        )}

        {/* --- WORKING STATUSES (IN_PROGRESS or EXTRAS_PENDING) --- */}
        {showControls && (
          <div className="grid grid-cols-[1fr_2fr] gap-4">
            
            {/* 1. Extras Button: ALWAYS ENABLED so you can check status/add more */}
            <button 
                onClick={onExtras} 
                className="bg-white text-gray-700 font-bold py-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isPendingExtras ? (
                 // Show indicator if pending
                 <div className="relative">
                    <PlusCircle className="w-5 h-5 text-gray-500" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white"></span>
                 </div>
              ) : (
                 <PlusCircle className="w-5 h-5 text-gray-500" /> 
              )}
              Extras
            </button>

            {/* 2. Complete Job Button: LOCKED if Extras are Pending */}
            {isPendingExtras ? (
                <button 
                    disabled 
                    className="bg-gray-100 text-gray-400 font-bold py-4 rounded-xl border border-gray-200 cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Lock className="w-4 h-4" /> 
                    <span>Waiting Approval...</span>
                </button>
            ) : (
                <button 
                    onClick={onComplete} 
                    className="bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    Complete Job <ChevronRight className="w-5 h-5 opacity-70" />
                </button>
            )}

          </div>
        )}
      </div>
    </div>
  );
};