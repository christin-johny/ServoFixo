import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { TechnicianDashboardStats } from "../../../domain/repositories/IDashboardRepository";
import { IGetTechnicianDashboardUseCase } from "../../interfaces/use-cases/dashboard/IDashboardUseCases";

export class GetTechnicianDashboardUseCase implements IGetTechnicianDashboardUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository
  ) {}

  async execute(technicianId: string): Promise<TechnicianDashboardStats> {
    const [earnings, technician, activeBooking] = await Promise.all([
      this._bookingRepo.getTechnicianEarnings(technicianId),
      this._technicianRepo.findById(technicianId),
      this._bookingRepo.findActiveBookingForTechnician(technicianId)
    ]);

    if (!technician) {
      throw new Error("Technician not found");
    }

    const ratings = technician.getRatings();  
    const wallet = technician.getWalletBalance();  

    return {
      performance: {
        averageRating: ratings.averageRating,
        totalJobs: ratings.totalReviews
      },
      earnings: {
        totalEarnings: earnings,
        walletBalance: wallet.currentBalance
      },
      activeJobId: activeBooking?.getId()
    };
  }
}