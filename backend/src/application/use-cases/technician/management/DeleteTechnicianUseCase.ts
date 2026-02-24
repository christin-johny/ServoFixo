import { IUseCase } from "../../../interfaces/services/IUseCase";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";

export class DeleteTechnicianUseCase implements IUseCase<void, [string]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this._technicianRepo.delete(id);
    if (!deleted) throw new Error("Failed to delete technician");
  }
}