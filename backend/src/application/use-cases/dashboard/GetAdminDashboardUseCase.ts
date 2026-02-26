import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { AdminDashboardStats } from "../../../domain/repositories/IDashboardRepository";
import { IGetAdminDashboardUseCase } from "../../interfaces/use-cases/dashboard/IDashboardUseCases";

export class GetAdminDashboardUseCase implements IGetAdminDashboardUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository
  ) {}

  async execute(): Promise<AdminDashboardStats> {
    const [bookingStats, techStats] = await Promise.all([
      this._bookingRepo.getAdminBookingStats(),
      this._technicianRepo.getAdminTechnicianStats()
    ]);

    const platformCommissionRate = 0.2; 
    const platformEarnings = bookingStats.revenue * platformCommissionRate;

    return {
      financials: {
        totalRevenue: bookingStats.revenue,
        platformEarnings: platformEarnings,techPayoutLiability: techStats.totalLiability 
      },
      bookings: {
        total: Object.values(bookingStats.statusCounts).reduce((a, b) => a + b, 0),
        active: this.calculateActiveBookings(bookingStats.statusCounts),
        completed: (bookingStats.statusCounts["COMPLETED"] || 0) + (bookingStats.statusCounts["PAID"] || 0),
        cancelled: bookingStats.statusCounts["CANCELLED"] || 0
      },
      technicians: {
        total: techStats.total,
        online: techStats.online,
        pendingVerification: techStats.pending
      }
    };
  }

  private calculateActiveBookings(counts: Record<string, number>): number {
    const activeStatuses = ["REQUESTED", "ACCEPTED", "EN_ROUTE", "REACHED", "IN_PROGRESS", "EXTRAS_PENDING"];
    return activeStatuses.reduce((sum, status) => sum + (counts[status] || 0), 0);
  }
}