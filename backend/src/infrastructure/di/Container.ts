// --- 1. Imports: Shared Infrastructure ---
import { S3ImageService } from '../S3multer/S3ImageService';

// --- 2. Imports: Zone Module ---
import { ZoneMongoRepository } from '../database/repositories/ZoneMongoRepository';
import { CreateZoneUseCase } from '../../application/use-cases/zones/CreateZoneUseCase';
import { GetAllZonesUseCase } from '../../application/use-cases/zones/GetAllZonesUseCase';
import { EditZoneUseCase } from '../../application/use-cases/zones/EditZoneUseCase';
import { DeleteZoneUseCase } from '../../application/use-cases/zones/DeleteZoneUseCase';
import { AdminZoneController } from '../../presentation/controllers/Admin/AdminZoneController';

// --- 3. Imports: Service Category Module ---
import { ServiceCategoryMongoRepository } from '../database/repositories/ServiceCategoryMongoRepository';
import { CreateCategoryUseCase } from '../../application/use-cases/service-categories/CreateCategoryUseCase';
import { GetAllCategoriesUseCase } from '../../application/use-cases/service-categories/GetAllCategoriesUseCase';
import { EditCategoryUseCase } from '../../application/use-cases/service-categories/EditCategoryUseCase';
import { DeleteCategoryUseCase } from '../../application/use-cases/service-categories/DeleteCategoryUseCase';
import { AdminCategoryController } from '../../presentation/controllers/Admin/AdminCategoryController';

// =================================================================
// WIRING (The Assembly Line)
// =================================================================

// A. SHARED SERVICES
const imageService = new S3ImageService();

// B. ZONE MODULE WIRING
const zoneRepo = new ZoneMongoRepository();

const createZoneUseCase = new CreateZoneUseCase(zoneRepo);
const getAllZonesUseCase = new GetAllZonesUseCase(zoneRepo);
const editZoneUseCase = new EditZoneUseCase(zoneRepo);
const deleteZoneUseCase = new DeleteZoneUseCase(zoneRepo);

export const adminZoneController = new AdminZoneController(
  createZoneUseCase,
  getAllZonesUseCase,
  deleteZoneUseCase,
  editZoneUseCase
);

// C. CATEGORY MODULE WIRING
const categoryRepo = new ServiceCategoryMongoRepository();

const createCategoryUseCase = new CreateCategoryUseCase(categoryRepo, imageService);
const getAllCategoriesUseCase = new GetAllCategoriesUseCase(categoryRepo);
const editCategoryUseCase = new EditCategoryUseCase(categoryRepo, imageService);
const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepo, imageService);

export const adminCategoryController = new AdminCategoryController(
  createCategoryUseCase,
  getAllCategoriesUseCase,
  editCategoryUseCase,
  deleteCategoryUseCase
);