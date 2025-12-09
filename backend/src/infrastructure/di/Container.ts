
import { S3ImageService } from '../storage/S3ImageService'; 

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

// --- 4. Imports: Service Item Module ---
import { ServiceItemMongoRepository } from '../database/repositories/ServiceItemMongoRepository';
import { CreateServiceItemUseCase } from '../../application/use-cases/service-items/CreateServiceItemUseCase';
import { GetAllServiceItemsUseCase } from '../../application/use-cases/service-items/GetAllServiceItemsUseCase';
import { DeleteServiceItemUseCase } from '../../application/use-cases/service-items/DeleteServiceItemUseCase';
import { EditServiceItemUseCase } from '../../application/use-cases/service-items/EditServiceItemUseCase';
import { AdminServiceItemController } from '../../presentation/controllers/Admin/AdminServiceItemController';


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

// D. SERVICE ITEM MODULE WIRING
const serviceItemRepo = new ServiceItemMongoRepository();

const createServiceItemUseCase = new CreateServiceItemUseCase(serviceItemRepo, imageService);
const getAllServiceItemsUseCase = new GetAllServiceItemsUseCase(serviceItemRepo);
const deleteServiceItemUseCase = new DeleteServiceItemUseCase(serviceItemRepo, imageService);
// ✅ Initialize Edit Use Case
const editServiceItemUseCase = new EditServiceItemUseCase(serviceItemRepo, imageService);

export const adminServiceItemController = new AdminServiceItemController(
  createServiceItemUseCase,
  getAllServiceItemsUseCase,
  deleteServiceItemUseCase,
  editServiceItemUseCase // ✅ Pass it to the controller
);