import React from "react";
import { Bike, ChevronRight, Map as MapIcon, PlusCircle } from "lucide-react";

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
  const isWorking = status === "IN_PROGRESS";

  return (
    <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-[40] md:pl-64 transition-all duration-300">
      <div className="max-w-3xl mx-auto">
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
        {isWorking && (
          <div className="grid grid-cols-[1fr_2fr] gap-4">
            <button onClick={onExtras} className="bg-white text-gray-700 font-bold py-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-[0.98]">
              <PlusCircle className="w-5 h-5 text-gray-500" /> Extras
            </button>
            <button onClick={onComplete} className="bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 active:scale-[0.98]">
              Complete Job <ChevronRight className="w-5 h-5 opacity-70" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};