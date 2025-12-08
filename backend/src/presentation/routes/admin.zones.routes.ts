import { Router } from 'express';
import { ZoneMongoRepository } from '../../infrastructure/database/repositories/ZoneMongoRepository';
import { CreateZoneUseCase } from '../../application/use-cases/zones/CreateZoneUseCase';
import { GetAllZonesUseCase } from '../../application/use-cases/zones/GetAllZonesUseCase';
import { DeleteZoneUseCase } from '../../application/use-cases/zones/DeleteZoneUseCase';
import { EditZoneUseCase } from '../../application/use-cases/zones/EditZoneUseCase'; // <--- Import
import { AdminZoneController } from '../controllers/AdminZoneController';
import { JwtService } from '../../infrastructure/security/JwtService';
import { makeAdminAuthMiddleware } from '../middlewares/adminAuth.middleware';

const router = Router();

// 1. Setup Dependencies
const zoneRepository = new ZoneMongoRepository();
const createZoneUseCase = new CreateZoneUseCase(zoneRepository);
const getAllZonesUseCase = new GetAllZonesUseCase(zoneRepository);
const deleteZoneUseCase = new DeleteZoneUseCase(zoneRepository);
const editZoneUseCase = new EditZoneUseCase(zoneRepository); // <--- Instantiate

// Inject all 4 use cases
const adminZoneController = new AdminZoneController(
  createZoneUseCase, 
  getAllZonesUseCase,
  deleteZoneUseCase,
  editZoneUseCase
);

const jwtService = new JwtService();
const adminAuth = makeAdminAuthMiddleware(jwtService);

// 3. Define Routes
router.post('/', adminAuth, adminZoneController.create);
router.get('/', adminAuth, adminZoneController.getAll);
router.delete('/:id', adminAuth, adminZoneController.delete);
router.put('/:id', adminAuth, adminZoneController.update); // <--- Add this Route!

export default router;