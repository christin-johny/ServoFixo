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
// ✅ Import Toggle Use Case
import { ToggleCategoryStatusUseCase } from '../../application/use-cases/service-categories/ToggleCategoryStatus';
import { AdminCategoryController } from '../../presentation/controllers/Admin/AdminCategoryController';

// --- 4. Imports: Service Item Module ---
import { ServiceItemMongoRepository } from '../database/repositories/ServiceItemMongoRepository';
import { CreateServiceItemUseCase } from '../../application/use-cases/service-items/CreateServiceItemUseCase';
import { GetAllServiceItemsUseCase } from '../../application/use-cases/service-items/GetAllServiceItemsUseCase';
import { DeleteServiceItemUseCase } from '../../application/use-cases/service-items/DeleteServiceItemUseCase';
import { EditServiceItemUseCase } from '../../application/use-cases/service-items/EditServiceItemUseCase';
// ✅ Import Toggle Use Case
import { ToggleServiceItemStatusUseCase } from '../../application/use-cases/service-items/ToggleServiceItemStatus';
import { AdminServiceItemController } from '../../presentation/controllers/Admin/AdminServiceItemController';

// --- 5. Imports: Customer Module ---
import { CustomerMongoRepository } from '../database/repositories/CustomerMongoRepository';
import { GetAllCustomersUseCase } from '../../application/use-cases/customer/GetAllCustomersUseCase';
import { AdminCustomerController } from '../../presentation/controllers/Admin/AdminCustomerController';
import { UpdateCustomerUseCase } from '../../application/use-cases/customer/UpdateCustomerUseCase'; 
import { GetCustomerByIdUseCase } from '../../application/use-cases/customer/GetCustomerByIdUseCase';
import { DeleteCustomerUseCase } from '../../application/use-cases/customer/DeleteCustomerUseCase';

// --- 6. Imports: Customer Auth & Services ---
import { CustomerServiceController } from '../../presentation/controllers/Customer/CustomerServiceController';
import { GetMostBookedServicesUseCase } from '../../application/use-cases/service-items/GetMostBookedServicesUseCase';

import { CustomerAuthController } from '../../presentation/controllers/Customer/CustomerAuthController';
import { RequestCustomerRegistrationOtpUseCase } from '../../application/use-cases/auth/RequestCustomerRegistrationOtpUseCase';
import { VerifyCustomerRegistrationOtpUseCase } from '../../application/use-cases/auth/VerifyCustomerRegistrationOtpUseCase';
import { CustomerLoginUseCase } from '../../application/use-cases/auth/CustomerLoginUseCase';
import { RequestCustomerForgotPasswordOtpUseCase } from '../../application/use-cases/auth/RequestCustomerForgotPasswordOtpUseCase';
import { VerifyCustomerForgotPasswordOtpUseCase } from '../../application/use-cases/auth/VerifyCustomerForgotPasswordOtpUseCase';
import { CustomerGoogleLoginUseCase } from '../../application/use-cases/auth/CustomerGoogleLoginUseCase';

// --- 7. Imports: Infrastructure Services ---
import { OtpSessionMongoRepository } from '../database/repositories/OtpSessionMongoRepository';
import { NodemailerEmailService } from '../email/NodemailerEmailService'; // Adjust path if needed
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';     // Adjust path if needed
import { JwtService } from '../security/JwtService'
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { AuthTokenController } from '../../presentation/controllers/AuthTokenController';

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

// ✅ FIX: Removed imageService (Soft Delete doesn't delete S3 images)
const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepo); 

// ✅ NEW: Instantiate Toggle Use Case
const toggleCategoryStatusUseCase = new ToggleCategoryStatusUseCase(categoryRepo);

export const adminCategoryController = new AdminCategoryController(
  createCategoryUseCase,
  getAllCategoriesUseCase,
  editCategoryUseCase,
  deleteCategoryUseCase,
  toggleCategoryStatusUseCase 
);

// D. SERVICE ITEM MODULE WIRING
const serviceItemRepo = new ServiceItemMongoRepository();

const createServiceItemUseCase = new CreateServiceItemUseCase(serviceItemRepo, imageService);
const getAllServiceItemsUseCase = new GetAllServiceItemsUseCase(serviceItemRepo);

// ✅ FIX: Removed imageService (Soft Delete)
const deleteServiceItemUseCase = new DeleteServiceItemUseCase(serviceItemRepo);
const editServiceItemUseCase = new EditServiceItemUseCase(serviceItemRepo, imageService);

// ✅ NEW: Instantiate Toggle Use Case
const toggleServiceItemStatusUseCase = new ToggleServiceItemStatusUseCase(serviceItemRepo);

export const adminServiceItemController = new AdminServiceItemController(
  createServiceItemUseCase,
  getAllServiceItemsUseCase,
  deleteServiceItemUseCase,
  editServiceItemUseCase,
  toggleServiceItemStatusUseCase // ✅ Injected
);

// E. CUSTOMER MODULE WIRING
const customerRepo = new CustomerMongoRepository();

const getAllCustomersUseCase = new GetAllCustomersUseCase(customerRepo);
const updateCustomerUseCase = new UpdateCustomerUseCase(customerRepo); 
const getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepo); 
const deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepo);

export const adminCustomerController = new AdminCustomerController(
    customerRepo, 
    getAllCustomersUseCase,
    updateCustomerUseCase,
    getCustomerByIdUseCase,
    deleteCustomerUseCase
);

// =================================================================
// F. INFRASTRUCTURE SERVICES
// =================================================================
const otpSessionRepo = new OtpSessionMongoRepository();
const emailService = new NodemailerEmailService(); 
const passwordHasher = new BcryptPasswordHasher();
const jwtService = new JwtService();


// =================================================================
// G. CUSTOMER AUTH MODULE
// =================================================================
const reqRegOtpUseCase = new RequestCustomerRegistrationOtpUseCase(customerRepo, otpSessionRepo, emailService);
const verRegOtpUseCase = new VerifyCustomerRegistrationOtpUseCase(customerRepo, otpSessionRepo, passwordHasher, jwtService);
const custLoginUseCase = new CustomerLoginUseCase(customerRepo, passwordHasher, jwtService);
const reqForgotOtpUseCase = new RequestCustomerForgotPasswordOtpUseCase(customerRepo, otpSessionRepo, emailService);
const verForgotOtpUseCase = new VerifyCustomerForgotPasswordOtpUseCase(customerRepo, otpSessionRepo, passwordHasher);
const googleLoginUseCase = new CustomerGoogleLoginUseCase(customerRepo, jwtService, process.env.GOOGLE_CLIENT_ID || '');

export const customerAuthController = new CustomerAuthController(
  reqRegOtpUseCase,
  verRegOtpUseCase,
  custLoginUseCase,
  reqForgotOtpUseCase,
  verForgotOtpUseCase,
  googleLoginUseCase
);


// =================================================================
// H. CUSTOMER SERVICE MODULE (Home Page)
// =================================================================
const getMostBookedUseCase = new GetMostBookedServicesUseCase(serviceItemRepo);

export const customerServiceController = new CustomerServiceController(
  getMostBookedUseCase
);

// =================================================================
// I. TOKEN MANAGEMENT
// =================================================================
const refreshTokenUseCase = new RefreshTokenUseCase(jwtService);
export const authTokenController = new AuthTokenController(refreshTokenUseCase);