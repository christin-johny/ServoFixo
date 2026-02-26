 
export interface AdminFinancials {
  totalRevenue: number;
  platformEarnings: number;
  techPayoutLiability: number;
}

export interface AdminBookingMetrics {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}

export interface AdminTechnicianMetrics {
  total: number;
  online: number;
  pendingVerification: number;
}

export interface AdminDashboardData {
  financials: AdminFinancials;
  bookings: AdminBookingMetrics;
  technicians: AdminTechnicianMetrics;
}
 
export interface TechPerformance {
  averageRating: number;
  totalJobs: number;
}

export interface TechEarnings {
  totalEarnings: number;
  walletBalance: number;
}





export interface TechnicianDashboardData {
  performance: {
    averageRating: number;
    totalJobs: number;
    completionRate: number;  
  };
  earnings: {
    totalEarnings: number;
    walletBalance: number;
    thisWeekEarnings: number; 
  };
  activeJob?: { 
    id: string;
    serviceName: string;
    customerName: string;
    location: string;
    status: string;
  };
}