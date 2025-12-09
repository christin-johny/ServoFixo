import { Request, Response } from 'express';
import { CreateServiceItemUseCase } from '../../../application/use-cases/service-items/CreateServiceItemUseCase';
import { GetAllServiceItemsUseCase } from '../../../application/use-cases/service-items/GetAllServiceItemsUseCase';
import { DeleteServiceItemUseCase } from '../../../application/use-cases/service-items/DeleteServiceItemUseCase';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

export class AdminServiceItemController {
  constructor(
    private readonly createUseCase: CreateServiceItemUseCase,
    private readonly getAllUseCase: GetAllServiceItemsUseCase,
    private readonly deleteUseCase: DeleteServiceItemUseCase
    // We will add EditUseCase later
  ) {}

  // 1. CREATE
  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { categoryId, name, description, basePrice, specifications, isActive } = req.body;
      
      // req.files is an array because of upload.array()
      const files = req.files as Express.Multer.File[]; 

      if (!files || files.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "At least one image is required." });
      }

      // Parse specifications (FormData sends it as a string)
      let parsedSpecs = [];
      try {
        parsedSpecs = specifications ? JSON.parse(specifications) : [];
      } catch (e) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid format for specifications." });
      }

      const serviceItem = await this.createUseCase.execute({
        categoryId,
        name,
        description,
        basePrice: Number(basePrice),
        specifications: parsedSpecs,
        isActive: isActive === 'true',
        imageFiles: files.map(f => ({
          buffer: f.buffer,
          originalName: f.originalname,
          mimeType: f.mimetype
        }))
      });

      return res.status(StatusCodes.CREATED).json({
        message: 'Service Item created successfully',
        serviceItem
      });
    } catch (err: any) {
      console.error('Create Service Item error:', err);
      if (err.message.includes('already exists')) {
        return res.status(StatusCodes.CONFLICT).json({ error: err.message });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  // 2. GET ALL (With Filters)
  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId as string | undefined; // Filter by Category
      
      let isActive: boolean | undefined;
      if (req.query.isActive === 'true') isActive = true;
      if (req.query.isActive === 'false') isActive = false;

      const result = await this.getAllUseCase.execute({ 
        page, limit, search, categoryId, isActive 
      });
      
      return res.status(StatusCodes.OK).json(result);
    } catch (err) {
      console.error('Get Service Items error:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  // 3. DELETE
  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.deleteUseCase.execute(id);
      return res.status(StatusCodes.OK).json({ message: 'Service Item deleted successfully' });
    } catch (err: any) {
      if (err.message === 'Service Item not found') {
        return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };
}