import { Router } from 'express';
import { ZoneMongoRepository } from '../../../infrastructure/database/repositories/ZoneMongoRepository';
import { CreateZoneUseCase } from '../../../application/use-cases/zones/CreateZoneUseCase';
import { GetAllZonesUseCase } from '../../../application/use-cases/zones/GetAllZonesUseCase';
import { DeleteZoneUseCase } from '../../../application/use-cases/zones/DeleteZoneUseCase';
import { EditZoneUseCase } from '../../../application/use-cases/zones/EditZoneUseCase';
import { AdminZoneController } from '../../controllers/Admin/AdminZoneController';
import { JwtService } from '../../../infrastructure/security/JwtService';
import { makeAdminAuthMiddleware } from '../../middlewares/adminAuth.middleware';

const router = Router();

const zoneRepository = new ZoneMongoRepository();
const createZoneUseCase = new CreateZoneUseCase(zoneRepository);
const getAllZonesUseCase = new GetAllZonesUseCase(zoneRepository);
const deleteZoneUseCase = new DeleteZoneUseCase(zoneRepository);
const editZoneUseCase = new EditZoneUseCase(zoneRepository); 

const adminZoneController = new AdminZoneController(
  createZoneUseCase, 
  getAllZonesUseCase,
  deleteZoneUseCase,
  editZoneUseCase
);

const jwtService = new JwtService();
const adminAuth = makeAdminAuthMiddleware(jwtService);

router.post('/', adminAuth, adminZoneController.create);
router.get('/', adminAuth, adminZoneController.getAll);
router.delete('/:id', adminAuth, adminZoneController.delete);
router.put('/:id', adminAuth, adminZoneController.update); 

export default router;