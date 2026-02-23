import React from "react";
import { AlertTriangle, Wallet, Hash } from "lucide-react";
import type { JobDetails } from "../../types/JobDetails";

interface JobHeaderProps {
  job: JobDetails;
  onCancel: () => void;
}

export const JobHeader: React.FC<JobHeaderProps> = ({ job, onCancel }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100';
      case 'EN_ROUTE': return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-100';
      case 'REACHED': return 'bg-yellow-50 text-yellow-800 border-yellow-200 ring-yellow-100';
      case 'IN_PROGRESS': return 'bg-green-50 text-green-700 border-green-200 ring-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 ring-gray-100';
    }
  };

  return (
    <>
      {/* 1. TOP ACTION BAR (Cancel) - Mobile Optimized */}
      {['ACCEPTED', 'EN_ROUTE', 'REACHED'].includes(job.status) && (
        <div className="flex justify-end mb-3">
            <button
              onClick={onCancel}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-100 bg-white text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wide">Cancel Job</span>
            </button>
        </div>
      )}

      {/* 2. INDUSTRIAL JOB CARD (No external margins, fills parent) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
          
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80"></div>

          {/* HEADER ROW: Meta Data Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-4 mt-1">
            
            {/* Status Badge */}
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ring-1 ring-inset ${getStatusColor(job.status)}`}>
              {job.status.replace("_", " ")}
            </span>

            {/* Vertical Divider */}
            <div className="h-4 w-px bg-gray-200"></div>

            {/* Job ID */}
            <div className="flex items-center gap-1 text-gray-500">
                <Hash className="w-3 h-3 opacity-50" />
                <span className="text-[11px] font-mono font-medium tracking-wide">
                    {job.id.slice(-6).toUpperCase()}
                </span>
            </div>

            {/* Earnings Badge (Compact & Aligned) */}
            <div className="ml-auto flex items-center gap-2 bg-emerald-50 pl-2 pr-3 py-1 rounded-md border border-emerald-100/50">
               <Wallet className="w-3.5 h-3.5 text-emerald-600" />
               <div className="flex items-baseline gap-1">
                 <span className="text-[9px] text-emerald-600/70 font-bold uppercase tracking-wider">EST.</span>
                 <span className="text-sm font-bold text-emerald-700 tabular-nums leading-none">
                    ₹{job.pricing.estimated}
                 </span>
               </div>
            </div>
          </div>

          {/* MAIN TITLE ROW */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {job.snapshots.service.name || job.service.name}
            </h1>
            {/* Optional Customer Name Subtitle could go here */}
          </div>

          {/* TIMELINE PROGRESS */}
          <div className="flex items-center gap-1.5">
            {['ACCEPTED', 'EN_ROUTE', 'REACHED', 'IN_PROGRESS'].map((step, idx) => {
              const activeSteps = ['ACCEPTED', 'EN_ROUTE', 'REACHED', 'IN_PROGRESS', 'COMPLETED'];
              const isActive = activeSteps.indexOf(job.status) >= idx;
              const isCurrent = job.status === step;
              
              return (
                <div key={step} className="flex-1 group">
                  <div className="relative">
                     {/* Bar */}
                     <div className={`h-1.5 rounded-full transition-all duration-500 ${isActive ? (step === 'IN_PROGRESS' ? 'bg-emerald-500' : 'bg-blue-600') : 'bg-gray-100'}`} />
                     
                     {/* Glow effect for current step */}
                     {isCurrent && (
                        <div className="absolute inset-0 bg-blue-400/30 blur-[2px] rounded-full animate-pulse"></div>
                     )}
                  </div>
                  
                  {/* Label */}
                  <div className={`mt-2 text-[9px] font-bold uppercase tracking-wider text-center transition-colors ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                    {step.replace("_", " ")}
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </>
  );
};