import { User, Phone, Calendar, CreditCard, MapPin, AlertCircle, Navigation, ShieldCheck, Clock } from "lucide-react";
import type { JobDetails } from "src/features/booking/types/JobDetails";

// --- 1. CUSTOMER CARD ---
export const CustomerCard = ({ job }: { job: JobDetails }) => {
  const name = job.snapshots?.customer?.name || job.customer?.name || "Customer";
  return (
    <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 text-gray-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">CUSTOMER</p>
            <p className="font-bold text-gray-900 text-base">{name}</p>
          </div>
        </div>
        <a href={`tel:${job.snapshots?.customer?.phone}`} className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">
          <Phone className="w-5 h-5" />
        </a>
      </div>
      <div className="mt-5 pt-4 border-t border-gray-50 flex gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> <span>Today</span></div>
        <div className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-gray-400" /> <span>Cash / Online</span></div>
      </div>
    </div>
  );
};

// --- 2. LOCATION CARD ---
export const LocationCard = ({ job, isWorking }: { job: JobDetails, isWorking: boolean }) => {
  const openMaps = () => {
    if (!job?.location?.coordinates) return;
    window.open(`http://maps.google.com/?q=${job.location.coordinates.lat},${job.location.coordinates.lng}`, '_blank');
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full">
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-1"><MapPin className="w-5 h-5 text-red-500" /></div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">LOCATION</p>
          <p className="text-sm text-gray-700 font-medium leading-relaxed">{job.location.address}</p>
        </div>
      </div>
      {job.meta?.instructions && (
        <div className="bg-yellow-50/50 p-3 rounded-lg flex gap-2.5 items-start border border-yellow-100 mb-4">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-800 font-medium">"{job.meta.instructions}"</p>
        </div>
      )}
      {!isWorking && (
        <button onClick={openMaps} className="mt-auto w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100">
          <Navigation className="w-4 h-4 text-gray-500" /> Navigate
        </button>
      )}
    </div>
  );
};

// --- 3. OTP CARD ---
export const OtpCard = ({ otp, setOtp }: { otp: string[], setOtp: (o: string[]) => void }) => {
  const handleChange = (i: number, v: string) => {
    if (isNaN(Number(v))) return;
    const newOtp = [...otp]; newOtp[i] = v; setOtp(newOtp);
    if (v && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  return (
    <div className="md:col-span-2 bg-white rounded-2xl shadow-lg shadow-blue-500/10 border border-blue-100 overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Security Verification</h2>
            <p className="text-sm text-gray-500">Ask the customer for the 4-digit PIN.</p>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          {otp.map((d, i) => (
            <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={d} onChange={(e) => handleChange(i, e.target.value)} className="w-12 h-14 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="•" />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 4. TIMER CARD ---
export const TimerCard = () => (
  <div className="md:col-span-2 bg-white rounded-2xl border border-green-100 p-6 flex flex-col items-center justify-center relative shadow-sm">
    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3 animate-pulse"><Clock className="w-7 h-7" /></div>
    <h3 className="text-lg font-bold text-green-800">Job in Progress</h3> 
  </div>
);