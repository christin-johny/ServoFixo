

export interface AdminDashboardStats {
  financials: {
    totalRevenue: number;      
    platformEarnings: number;  
    techPayoutLiability: number;  
  };
  bookings: {
    total: number;
    active: number;    // Statuses: REQUESTED, ACCEPTED, IN_PROGRESS, etc.
    completed: number; // Status: COMPLETED or PAID
    cancelled: number; // Status: CANCELLED
  };
  technicians: {
    total: number;
    online: number;    // availability.isOnline === true
    pendingVerification: number; // verificationStatus === "VERIFICATION_PENDING"
  };
}

export interface TechnicianDashboardStats {
  performance: {
    averageRating: number;  
    totalJobs: number;      
  };
  earnings: {
    totalEarnings: number;  
    walletBalance: number;  
  };
  activeJobId?: string;  
}