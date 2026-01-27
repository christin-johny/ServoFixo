// src/presentation/pages/Technician/Job/ActiveJobPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotification } from "../../../hooks/useNotification";
import {
  getTechnicianBookingById,
  verifyBookingOtp,
  updateBookingStatus,
  cancelBookingByTechnician
} from "../../../../infrastructure/repositories/technician/technicianBookingRepository";
import LoaderFallback from "../../../components/LoaderFallback";
import ConfirmModal from "../../../components/Shared/ConfirmModal/ConfirmModal";
import CancellationModal from "../../../components/Technician/Job/CancellationModal";

// Import split components
import { JobHeader } from "../../../components/Technician/Job/JobHeader";
import { JobFooter } from "../../../components/Technician/Job/JobFooter";
import { CustomerCard, LocationCard, OtpCard, TimerCard } from "../../../components/Technician/Job/JobCards";

// Define Interface locally or import from a shared types file
export interface JobDetails {
  id: string;
  status: string;
  service: { name: string; categoryId: string };
  customer: { name: string; phone: string; avatarUrl?: string };
  location: { address: string; coordinates: { lat: number; lng: number } };
  pricing: { estimated: number };
  snapshots: { customer: { name: string; phone: string }; service: { name: string }; };
  meta?: { instructions?: string };
}

const ActiveJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  
  // Modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean; title: string; message: string; confirmText: string;
    variant: "primary" | "success" | "danger"; action: () => void;
  }>({
    isOpen: false, title: "", message: "", confirmText: "Confirm", variant: "primary", action: () => { }
  });

  // Load Job
  const fetchJob = async () => {
    try {
      if (!id) return;
      const data = await getTechnicianBookingById(id);
      setJob(data);
    } catch { showError("Failed to load job details."); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJob(); }, [id]);

  // Actions
  const executeStatusUpdate = async (status: string) => {
    if (!job) return;
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    setActionLoading(true);
    try {
      await updateBookingStatus(job.id, status);
      showSuccess("Status Updated");
      fetchJob();
    } catch  { showError("Failed to update status."); } 
    finally { setActionLoading(false); }
  };

  const executeStartJob = async () => {
    const code = otp.join("");
    if (code.length !== 4) return showError("Enter complete OTP.");
    
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    setActionLoading(true);
    try {
      if (!job) return;
      await verifyBookingOtp(job.id, code);
      showSuccess("Job Started!");
      fetchJob();
    } catch (err: unknown) {
  let msg = "Invalid OTP.";

  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err
  ) {
    const response = (err as { response?: unknown }).response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = (response as { data?: unknown }).data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        msg = data.message;
      }
    }
  }

  showError(msg);
  setOtp(["", "", "", ""]);
}

    finally { setActionLoading(false); }
  };

  const handleCancelJob = async (reason: string) => {
    if (!job) return;
    setActionLoading(true);
    try {
      await cancelBookingByTechnician(job.id, reason);
      showSuccess("Job cancelled");
      navigate("/technician/dashboard");
    } catch (err: unknown) {
  let msg = "Failed to cancel job";

  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err
  ) {
    const response = (err as { response?: unknown }).response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = (response as { data?: unknown }).data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        msg = data.message;
      }
    }
  }

  showError(msg);
  setIsCancelModalOpen(false);
}

    finally { setActionLoading(false); }
  };

  // UI Handlers (Trigger Modals)
  const triggers = {
    enRoute: () => setModalConfig({
      isOpen: true, title: "Start Travel?", message: "Notify customer you are en route?", confirmText: "Yes, Leaving", variant: "primary", action: () => executeStatusUpdate("EN_ROUTE")
    }),
    reached: () => setModalConfig({
      isOpen: true, title: "Arrived?", message: "Confirm arrival at location.", confirmText: "Yes, Here", variant: "primary", action: () => executeStatusUpdate("REACHED")
    }),
    start: () => setModalConfig({
      isOpen: true, title: "Start Service", message: "Verify problem and start timer?", confirmText: "Verify & Start", variant: "success", action: executeStartJob
    })
  };

  if (loading) return <LoaderFallback />;
  if (!job) return null;

  const isWorking = job.status === "IN_PROGRESS";

  return (
    <div className="min-h-screen bg-[#F8F9FC] relative flex flex-col font-sans">
      <ConfirmModal 
        isOpen={modalConfig.isOpen} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
        onConfirm={modalConfig.action} title={modalConfig.title} message={modalConfig.message} 
        confirmText={modalConfig.confirmText} variant={modalConfig.variant} 
      />
      <CancellationModal 
        isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} 
        onConfirm={handleCancelJob} isLoading={actionLoading} 
      />

      <div className="flex-1 pb-48">
        <JobHeader job={job} onCancel={() => setIsCancelModalOpen(true)} />

        <div className="max-w-5xl mx-auto px-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomerCard job={job} />
            <LocationCard job={job} isWorking={isWorking} />
            
            {job.status === "REACHED" && <OtpCard otp={otp} setOtp={setOtp} />}
            {isWorking && <TimerCard />}
          </div>
        </div>
      </div>

      <JobFooter 
        status={job.status} 
        loading={actionLoading}
        onEnRoute={triggers.enRoute}
        onReached={triggers.reached}
        onStart={triggers.start}
        onExtras={() => navigate(`/technician/jobs/${id}/extras`)}
        onComplete={() => navigate(`/technician/jobs/${id}/complete`)}
      />
    </div>
  );
};

export default ActiveJobPage;