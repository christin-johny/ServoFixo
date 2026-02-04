import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Receipt, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getTechnicianBookingById } from "../../../../infrastructure/repositories/technician/technicianBookingRepository";
import LoaderFallback from "../../../components/LoaderFallback";
import { type JobDetails } from "../Job/ActiveJobPage";  

const TechnicianBookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (!id) return;
        const data = await getTechnicianBookingById(id) as JobDetails;
        setJob(data);
      } catch   {
        navigate("/technician/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return <LoaderFallback />;
  if (!job) return null;

  const isCancelled = ["CANCELLED", "REJECTED", "FAILED_ASSIGNMENT", "TIMEOUT", "CANCELLED_BY_TECH"].includes(job.status);
  const isPaid = job.status === "PAID";

  return (
    <div className="w-full min-h-screen space-y-6 animate-fade-in pb-24 md:pb-12 font-sans bg-[#F5F7FB]">
      
      {/* --- 1. MATCHING HEADER (Same as MyJobsPage) --- */}
      <div className="space-y-4 pt-4 px-4">
        <div>
            <button
                onClick={() => navigate("/technician/jobs")} // Back to History
                className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-1"
            >
                <div className="p-1 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Back to History
            </button>
        </div>

        <div className="flex justify-between items-start px-1">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Job Details
                </h1>
                <p className="text-sm text-gray-500 font-mono">
                    ID: #{job.id.slice(-6).toUpperCase()}
                </p>
            </div>
            
            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                isCancelled 
                  ? "bg-red-50 text-red-700 border-red-100" 
                  : "bg-green-50 text-green-700 border-green-100"
            }`}>
                {isCancelled ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {job.status.replace(/_/g, " ")}
            </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6">
        
        {/* --- 2. FINANCIAL SUMMARY (Invoice) --- */}
        {!isCancelled && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-gray-500" />
                    <h3 className="font-bold text-gray-900 text-sm">Earnings Report</h3>
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Base Price</span>
                        <span>₹{job.pricing.estimated}</span>
                    </div>
                    {/* Placeholder for extras if you add them to JobDetails type later */}
                    
                    <div className="border-t border-dashed border-gray-200 my-2 pt-2 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Earnings</span>
                        <span className="font-bold text-xl text-green-600">₹{job.pricing.final || job.pricing.estimated}</span>
                    </div>
                    
                    {isPaid ? (
                        <div className="mt-2 bg-green-50 text-green-800 text-xs px-3 py-2 rounded-lg text-center font-medium flex items-center justify-center gap-2">
                           <CheckCircle2 className="w-3.5 h-3.5"/> Payment Received via Online Transfer
                        </div>
                    ) : (
                        <div className="mt-2 bg-yellow-50 text-yellow-800 text-xs px-3 py-2 rounded-lg text-center font-medium flex items-center justify-center gap-2">
                           <Clock className="w-3.5 h-3.5"/> Payment Pending
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- 3. SERVICE DETAILS --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Service Info</h3>
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Service Category</p>
                        <p className="font-medium text-gray-900">{job.snapshots.service.name}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-medium text-gray-900 text-sm">{job.location.address}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- 4. CUSTOMER INFO (Read Only) --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 opacity-75">
            <h3 className="font-bold text-gray-900 mb-4">Customer</h3>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                    {job.snapshots.customer.name.charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-gray-900">{job.snapshots.customer.name}</p>
                    <p className="text-xs text-gray-500">Phone hidden for privacy</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TechnicianBookingDetails;