import { Request, Response } from 'express';
import { CreateZoneUseCase } from '../../application/use-cases/zones/CreateZoneUseCase';
import { GetAllZonesUseCase } from '../../application/use-cases/zones/GetAllZonesUseCase';
import { DeleteZoneUseCase } from '../../application/use-cases/zones/DeleteZoneUseCase';
import { EditZoneUseCase } from '../../application/use-cases/zones/EditZoneUseCase';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';

export class AdminZoneController {
  constructor(
    private readonly createZoneUseCase: CreateZoneUseCase,
    private readonly getAllZonesUseCase: GetAllZonesUseCase,
    private readonly deleteZoneUseCase: DeleteZoneUseCase,
    private readonly editZoneUseCase: EditZoneUseCase
  ) {}

  // 1. CREATE
  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, description, boundaries, isActive } = req.body;

      if (!name || !boundaries || !Array.isArray(boundaries) || boundaries.length < 3) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS + ' (Valid boundaries required)',
        });
      }

      const zone = await this.createZoneUseCase.execute({
        name,
        description,
        boundaries,
        isActive,
      });

      return res.status(StatusCodes.CREATED).json({
        message: 'Zone created successfully',
        zone,
      });
    } catch (err: any) {
      console.error('Create zone error:', err);
      
      // Handle Duplicate Name
      if (err.message === 'Zone with this name already exists') {
        return res.status(StatusCodes.CONFLICT).json({ error: err.message });
      }

      // ✅ NEW: Handle Invalid Polygon Shape
      if (err.message && err.message.includes('Invalid Zone Shape')) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Extract Query Params with defaults
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      
      let isActive: boolean | undefined;
      if (req.query.isActive === 'true') isActive = true;
      if (req.query.isActive === 'false') isActive = false;

      const result = await this.getAllZonesUseCase.execute({ 
        page, 
        limit, 
        search, 
        isActive 
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (err) {
      console.error('Get all zones error:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  // 3. DELETE
  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.deleteZoneUseCase.execute(id);
      return res.status(StatusCodes.OK).json({ message: 'Zone deleted successfully' });
    } catch (err: any) {
      console.error('Delete zone error:', err);
      if (err.message === 'Zone not found or could not be deleted') {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Zone not found' });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  // 4. UPDATE
  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name, description, boundaries, isActive } = req.body;

      if (boundaries && (!Array.isArray(boundaries) || boundaries.length < 3)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Valid boundaries (at least 3 points) are required if updating location',
        });
      }

      const updatedZone = await this.editZoneUseCase.execute({
        id,
        name,
        description,
        boundaries,
        isActive
      });

      return res.status(StatusCodes.OK).json({
        message: 'Zone updated successfully',
        zone: updatedZone,
      });
    } catch (err: any) {
      console.error('Update zone error:', err);
      
      if (err.message === 'Zone not found') {
        return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
      }
      
      if (err.message === 'Zone with this name already exists') {
        return res.status(StatusCodes.CONFLICT).json({ error: err.message });
      }

      // ✅ NEW: Handle Invalid Polygon Shape during Update
      if (err.message && err.message.includes('Invalid Zone Shape')) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };
}