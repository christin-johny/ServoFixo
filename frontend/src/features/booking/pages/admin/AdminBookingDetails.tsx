import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Calendar, User, Phone, 
  AlertTriangle, CreditCard, Truck, AlertCircle,
  Briefcase, CheckCircle2, XCircle, Clock, Ban
} from "lucide-react";
import { format } from "date-fns";

// Services & Repos
import { 
  getBookingDetails, 
  forceAssignTechnician,  
  forceCancelBooking,     
  forceStatusUpdate, 
  type AdminBookingDetailDto, 
  type BookingStatus 
} from "../../api/adminBookingRepository"; 
import { socketService, type AdminUpdateEvent } from "../../../../lib/socketClient"; 
import { useNotification } from "../../../notifications/hooks/useNotification";

// Components
import LoaderFallback from "../../../../components/LoaderFallback";
import BookingTimeline from "../../components/admin/BookingTimeline"; 
import BookingMap from "../../components/admin/BookingMap"; 
 
import { ForceCancelModal,  } from "../../components/admin/ActionModals"; 
import ForceStatusModal from "../../components/admin/ForceStatusModal";
import ForceAssignModal from "../../components/admin/ForceAssignModal";

const AdminBookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [booking, setBooking] = useState<AdminBookingDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  //   Modal States
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [isCancelOpen, setCancelOpen] = useState(false);
  const [isStatusOpen, setStatusOpen] = useState(false);

  // --- 1. Initial Fetch ---
  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getBookingDetails(id); 
      setBooking(data);
    } catch (err) {
      console.error(err);
      showError("Failed to load booking details");
      navigate("/admin/bookings");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Real-Time Listener ---
  useEffect(() => {
    if (!id) return;

    socketService.onAdminDataUpdate((event: AdminUpdateEvent) => {
      if (event.bookingId === id) {
        if (event.status && booking) {
            setBooking((prev) => prev ? ({ ...prev, status: event.status as BookingStatus }) : null);
        }
        fetchDetails(); 
      }
    });

    return () => {
      socketService.offAdminDataUpdate();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, booking]);

  // --- 3. Handlers (God Mode) ---
  const handleForceAssign = async (techId: string) => {
    if (!booking) return;
    try {
        await forceAssignTechnician(booking.id, techId);
        showSuccess("Technician Assigned Successfully");
        fetchDetails(); // Refresh
    } catch  {
        showError("Failed to assign technician");
    }
  };

  const handleForceCancel = async (reason: string) => {
    if (!booking) return;
    try {
        await forceCancelBooking(booking.id, reason);
        showSuccess("Booking Cancelled");
        fetchDetails();
    } catch {
        showError("Failed to cancel booking");
    }
  };

  const handleForceStatusChange = async (newStatus: string, reason: string) => {
    if (!booking) return;
    try {
        //   Calls the generic endpoint
        await forceStatusUpdate(booking.id, newStatus, reason);
        showSuccess(`Status updated to ${newStatus}`);
        setStatusOpen(false);
        fetchDetails();
    } catch   {
        showError("Failed to update status");
    }
  };


  // --- 4. Helper: Status Badge ---
  const renderStatusBadge = (status: BookingStatus) => {
     const s = status.replace(/_/g, " ");
     let colorClass = "bg-gray-100 text-gray-700 border-gray-200";
     let Icon = Clock;
 
     if (["COMPLETED", "PAID"].includes(status)) {
       colorClass = "bg-green-50 text-green-700 border-green-200";
       Icon = CheckCircle2;
     } else if (["CANCELLED", "FAILED_ASSIGNMENT", "TIMEOUT", "CANCELLED_BY_TECH"].includes(status)) {
       colorClass = "bg-red-50 text-red-700 border-red-200";
       Icon = XCircle;
     } else if (["IN_PROGRESS", "ACCEPTED", "EN_ROUTE"].includes(status)) {
       colorClass = "bg-blue-50 text-blue-700 border-blue-200 animate-pulse";
       Icon = Briefcase;
     } else if (status === "REQUESTED") {
       colorClass = "bg-orange-50 text-orange-700 border-orange-200 animate-pulse";
       Icon = AlertCircle;
     }
     
     return (
         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${colorClass} ml-3 align-middle`}>
             <Icon size={14} />
             {s}
         </span>
     );
  };

  if (loading) return <LoaderFallback />;
  if (!booking) return <div className="p-8 text-center text-gray-500">Booking not found.</div>;
    const showForceAssign = [
      "REQUESTED", 
      "FAILED_ASSIGNMENT", 
      "TIMEOUT", 
      "ASSIGNED_PENDING"  
  ].includes(booking.status);

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-hidden bg-gray-50/30">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0 bg-white px-4 pt-4 sm:px-0 sm:pt-0 sm:bg-transparent">
         <div className="flex items-start gap-3">
            <button 
                onClick={() => navigate(-1)} 
                className="mt-1 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                title="Back to List"
            >
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center flex-wrap gap-y-2">
                    Booking #{booking.id.slice(-6).toUpperCase()}
                    {renderStatusBadge(booking.status)}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Calendar size={14} /> 
                    Created on {format(new Date(booking.timestamps.createdAt), "PPP 'at' p")}
                </p>
            </div>
         </div>

         {/*   God Mode Actions */}
         <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
             
             {/* 1. FORCE ASSIGN (Rescue Mode) */}
             {showForceAssign && (
                 <button 
                    onClick={() => setAssignOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition text-sm"
                 >
                    <User size={16} /> Force Assign
                 </button>
             )}

             {/* 2. FORCE CANCEL (The Missing Button) */}
             {["ACCEPTED", "ASSIGNED_PENDING", "IN_PROGRESS", "EN_ROUTE", "REACHED", "EXTRAS_PENDING"].includes(booking.status) && (
                 <button 
                    onClick={() => setCancelOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition text-sm shadow-sm"
                 >
                    <XCircle size={16} /> Force Cancel
                 </button>
             )}

             {/* 3. OVERRIDE STATUS (Master Key) */}
             <button 
                onClick={() => setStatusOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition text-sm shadow-sm"
                title="Manually set any status"
             >
                <AlertTriangle size={16} className="text-orange-500" />
                Override Status
             </button>

         </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-0 pb-6">
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-[1600px] mx-auto">

            {/* COL 1: Map & Order */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* 1. Map */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-64 bg-gray-100 relative">
                        {booking.location.coordinates ? (
                            <BookingMap 
                               lat={booking.location.coordinates.lat} 
                               lng={booking.location.coordinates.lng} 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                Map Unavailable
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-200 flex items-start gap-3">
                        <MapPin className="text-blue-600 mt-1 shrink-0" size={20} />
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Service Location</p>
                            <p className="text-gray-500 text-sm">{booking.location.address}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Order Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard size={14} /> Order Summary
                    </h3>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-900 font-medium">{booking.snapshots.service.name}</span>
                        <span className="text-gray-600">₹{booking.pricing.estimated}</span>
                    </div>
                    {booking.extraCharges?.map((charge) => (
                        <div key={charge.id} className="flex justify-between items-center py-3 border-b border-gray-100 text-sm">
                            <span className="text-gray-500 flex items-center gap-2">
                                + {charge.title} 
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${charge.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {charge.status}
                                </span>
                            </span>
                            <span className="font-medium">₹{charge.amount}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 text-lg font-bold text-gray-900">
                        <span>Total Amount</span>
                        <span>₹{booking.pricing.final || booking.pricing.estimated}</span>
                    </div>
                </div>
            </div>

            {/* COL 2: People */}
            <div className="space-y-6">
                
                {/* 1. Customer */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                            <User size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{booking.snapshots.customer.name}</p>
                            <p className="text-sm text-gray-500 truncate">{booking.snapshots.customer.phone}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                         <button className="flex-1 py-2 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 border border-gray-200 transition-colors">
                             <Phone size={14} /> Call
                         </button>
                         <button 
                            onClick={() => navigate(`/admin/customers/${booking.customerId}`)}
                            className="flex-1 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors"
                         >
                             Profile
                         </button>
                    </div>
                </div>

                {/* 2. Technician Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                    
                    {/* CASE A: Technician IS Assigned */}
                    {booking.snapshots.technician && booking.technicianId ? (
                        <>
                             <div className="absolute top-4 right-4">
                                 <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Assigned</span>
                             </div>
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Technician</h3>
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                                    {booking.snapshots.technician.avatarUrl ? (
                                        <img src={booking.snapshots.technician.avatarUrl} alt="Tech" className="w-full h-full object-cover"/>
                                    ) : (
                                        <Truck size={20} className="text-gray-500" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{booking.snapshots.technician.name}</p>
                                    <p className="text-sm text-gray-500 truncate">{booking.snapshots.technician.phone}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button 
                                    onClick={() => navigate(`/admin/technicians/${booking.technicianId}`)}
                                    className="w-full py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors"
                                >
                                    View Profile
                                </button>
                            </div>
                        </>
                    ) : (
                        /* CASE B: No Active Technician */
                        <div className="text-center py-6">
                            
                            {["FAILED_ASSIGNMENT", "TIMEOUT"].includes(booking.status) ? (
                                <>
                                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-100">
                                        <Ban size={20} />
                                    </div>
                                    <p className="font-bold text-gray-900">Assignment Failed</p>
                                    <p className="text-xs text-gray-500 mt-1">System could not find a technician.</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-orange-100">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <p className="font-bold text-gray-900">Unassigned</p>
                                    <p className="text-sm text-gray-500 mb-4">No technician is currently active.</p>
                                    
                                    {/* Wired Up to State */}
                                    {booking.status === "REQUESTED" && (
                                        <button 
                                            onClick={() => setAssignOpen(true)}
                                            className="text-sm text-blue-600 font-bold hover:underline"
                                        >
                                            Assign Manually
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. Timeline */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Activity Log</h3>
                    <BookingTimeline timeline={booking.timeline} />
                </div>

            </div>
         </div>
      </div>

      {/*   Render Modals */}
      {booking && (
        <ForceAssignModal 
            isOpen={isAssignOpen} 
            onClose={() => setAssignOpen(false)} 
            onAssign={handleForceAssign}  
            context={{
                zoneId: booking.zoneId,
                serviceId: booking.serviceId
            }}
        />
      )}
      <ForceCancelModal 
        isOpen={isCancelOpen} 
        onClose={() => setCancelOpen(false)} 
        onConfirm={handleForceCancel} 
      />
      <ForceStatusModal 
        isOpen={isStatusOpen} 
        onClose={() => setStatusOpen(false)} 
        currentStatus={booking.status}
        onUpdate={handleForceStatusChange} 
      />

    </div>
  );
};

export default AdminBookingDetails;