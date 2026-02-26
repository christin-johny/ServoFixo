import { AdminDashboardStats, TechnicianDashboardStats } from "../../../../domain/repositories/IDashboardRepository";

export interface IGetAdminDashboardUseCase {
  execute(): Promise<AdminDashboardStats>;
}

export interface IGetTechnicianDashboardUseCase {
  execute(technicianId: string): Promise<TechnicianDashboardStats>;
}