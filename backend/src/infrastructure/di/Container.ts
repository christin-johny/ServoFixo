import { S3ImageService } from "../storage/S3ImageService";
import redis from "../redis/redisClient";
import { RedisCacheService } from "../services/RedisCacheService";
import { GoogleAuthService } from "../services/GoogleAuthService";

// --- Zone Module ---
import { ZoneMongoRepository } from "../database/repositories/ZoneMongoRepository";
import { CreateZoneUseCase } from "../../application/use-cases/zones/CreateZoneUseCase";
import { GetAllZonesUseCase } from "../../application/use-cases/zones/GetAllZonesUseCase";
import { EditZoneUseCase } from "../../application/use-cases/zones/EditZoneUseCase";
import { DeleteZoneUseCase } from "../../application/use-cases/zones/DeleteZoneUseCase";
import { AdminZoneController } from "../../presentation/controllers/Admin/AdminZoneController";

// --- Service Category Module ---
import { ServiceCategoryMongoRepository } from "../database/repositories/ServiceCategoryMongoRepository";
import { CreateCategoryUseCase } from "../../application/use-cases/service-categories/CreateCategoryUseCase";
import { GetAllCategoriesUseCase } from "../../application/use-cases/service-categories/GetAllCategoriesUseCase";
import { EditCategoryUseCase } from "../../application/use-cases/service-categories/EditCategoryUseCase";
import { DeleteCategoryUseCase } from "../../application/use-cases/service-categories/DeleteCategoryUseCase";
import { ToggleCategoryStatusUseCase } from "../../application/use-cases/service-categories/ToggleCategoryStatus";
import { AdminCategoryController } from "../../presentation/controllers/Admin/AdminCategoryController";

// --- Service Item Module ---
import { ServiceItemMongoRepository } from "../database/repositories/ServiceItemMongoRepository";
import { CreateServiceItemUseCase } from "../../application/use-cases/service-items/CreateServiceItemUseCase";
import { GetAllServiceItemsUseCase } from "../../application/use-cases/service-items/GetAllServiceItemsUseCase";
import { DeleteServiceItemUseCase } from "../../application/use-cases/service-items/DeleteServiceItemUseCase";
import { EditServiceItemUseCase } from "../../application/use-cases/service-items/EditServiceItemUseCase";
import { ToggleServiceItemStatusUseCase } from "../../application/use-cases/service-items/ToggleServiceItemStatus";
import { AdminServiceItemController } from "../../presentation/controllers/Admin/AdminServiceItemController";

// --- Customer Module ---
import { CustomerMongoRepository } from "../database/repositories/CustomerMongoRepository";
import { GetAllCustomersUseCase } from "../../application/use-cases/customer/GetAllCustomersUseCase";
import { AdminCustomerController } from "../../presentation/controllers/Admin/AdminCustomerController";
import { UpdateCustomerUseCase } from "../../application/use-cases/customer/UpdateCustomerUseCase";
import { GetCustomerByIdUseCase } from "../../application/use-cases/customer/GetCustomerByIdUseCase";
import { DeleteCustomerUseCase } from "../../application/use-cases/customer/DeleteCustomerUseCase";

// --- Customer Auth & Services ---
import { CustomerServiceController } from "../../presentation/controllers/Customer/CustomerServiceController";
import { GetMostBookedServicesUseCase } from "../../application/use-cases/service-items/GetMostBookedServicesUseCase";
import { CustomerAuthController } from "../../presentation/controllers/Customer/CustomerAuthController";
import { RequestCustomerRegistrationOtpUseCase } from "../../application/use-cases/auth/RequestCustomerRegistrationOtpUseCase";
import { VerifyCustomerRegistrationOtpUseCase } from "../../application/use-cases/auth/VerifyCustomerRegistrationOtpUseCase";
import { CustomerLoginUseCase } from "../../application/use-cases/auth/CustomerLoginUseCase";
import { RequestCustomerForgotPasswordOtpUseCase } from "../../application/use-cases/auth/RequestCustomerForgotPasswordOtpUseCase";
import { VerifyCustomerForgotPasswordOtpUseCase } from "../../application/use-cases/auth/VerifyCustomerForgotPasswordOtpUseCase";
import { CustomerGoogleLoginUseCase } from "../../application/use-cases/auth/CustomerGoogleLoginUseCase";
import { CustomerCategoryController } from "../../presentation/controllers/Customer/CustomerCategoryController";
import { CustomerProfileController } from "../../presentation/controllers/Customer/CustomerProfileController";
import { GetServiceListingUseCase } from "../../application/use-cases/service-items/GetServiceListingUseCase";
import { GetServiceByIdUseCase } from "../../application/use-cases/service-items/GetServiceByIdUseCase";

// --- Technician Module ---
import { TechnicianMongoRepository } from "../database/repositories/TechnicianMongoRepository";
import { RequestTechnicianRegistrationOtpUseCase } from "../../application/use-cases/technician/auth/RequestTechnicianRegistrationOtpUseCase";
import { VerifyTechnicianRegistrationOtpUseCase } from "../../application/use-cases/technician/auth/VerifyTechnicianRegistrationOtpUseCase";
import { TechnicianLoginUseCase } from "../../application/use-cases/technician/auth/TechnicianLoginUseCase";
import { TechnicianAuthController } from "../../presentation/controllers/Technician/TechnicianAuthController";
import { TechnicianDataController } from "../../presentation/controllers/Technician/TechnicianDataController";
import { FixedCommissionStrategy } from "../services/FixedCommissionStrategy";
import { GetTechnicianRateCardUseCase } from "../../application/use-cases/technician/profile/GetTechnicianRateCardUseCase";
import { UpdateTechnicianUseCase } from "../../application/use-cases/technician/profile/UpdateTechnicianUseCase";
import { BlockTechnicianUseCase } from "../../application/use-cases/technician/profile/BlockTechnicianUseCase";
import { DeleteTechnicianUseCase } from "../../application/use-cases/technician/profile/DeleteTechnicianUseCase";
// --- Technician Profile Imports ---
import { TechnicianOnboardingUseCase } from "../../application/use-cases/technician/profile/TechnicianOnboardingUseCase"; 
import { GetTechnicianProfileUseCase } from "../../application/use-cases/technician/profile/GetTechnicianProfileUseCase";
import { TechnicianProfileController } from "../../presentation/controllers/Technician/TechnicianProfileController";
import { UploadTechnicianFileUseCase } from "../../application/use-cases/technician/profile/UploadTechnicianFileUseCase";
import { GetVerificationQueueUseCase } from "../../application/use-cases/technician/profile/GetVerificationQueueUseCase";
import { AdminTechnicianController } from "../../presentation/controllers/Admin/AdminTechnicianController";
import { GetTechnicianFullProfileUseCase } from "../../application/use-cases/technician/profile/GetTechnicianFullProfileUseCase"; 
import { VerifyTechnicianUseCase } from "../../application/use-cases/technician/profile/VerifyTechnicianUseCase"; 
import { GetAllTechniciansUseCase } from "../../application/use-cases/technician/profile/GetAllTechniciansUseCase";
// --- Admin Auth---
import { AdminLoginUseCase } from "../../application/use-cases/auth/AdminLoginUseCase";
import { AdminAuthController } from "../../presentation/controllers/Admin/AdminAuthController";
import { AdminMongoRepository } from "../database/repositories/AdminMongoRepository";

// --- Infrastructure Services ---
import { OtpSessionMongoRepository } from "../database/repositories/OtpSessionMongoRepository";
import { NodemailerEmailService } from "../email/NodemailerEmailService";
import { BcryptPasswordHasher } from "../security/BcryptPasswordHasher";
import { JwtService } from "../security/JwtService";
import { RefreshTokenUseCase } from "../../application/use-cases/auth/RefreshTokenUseCase";
import { AuthTokenController } from "../../presentation/controllers/AuthTokenController";

import { ZoneService } from "../../application/services/ZoneService";
import { AddressMongoRepository } from "../database/repositories/AddressMongoRepository";
// --- Customer Zone Module Imports ---
import { FindZoneByLocationUseCase } from "../../application/use-cases/zones/FindZoneByLocationUseCase";
import { CustomerZoneController } from "../../presentation/controllers/Customer/CustomerZoneController";
//Address

import { CustomerAddressController } from "../../presentation/controllers/Customer/CustomerAddressController";
import { AddAddressUseCase } from "../../application/use-cases/address/AddAddressUseCase";
import { UpdateAddressUseCase } from "../../application/use-cases/address/UpdateAddressUseCase";
import { GetAddressesUseCase } from "../../application/use-cases/address/GetAddressesUseCase";
import { DeleteAddressUseCase } from "../../application/use-cases/address/DeleteAddressUseCase";
import { GetCustomerProfileUseCase } from "../../application/use-cases/customer/GetCustomerProfileUseCase";
import { UploadAvatarUseCase } from "../../application/use-cases/customer/UploadAvatarUseCase";
import { ChangePasswordUseCase } from "../../application/use-cases/customer/ChangePasswordUseCase";
import { RequestTechnicianForgotPasswordOtpUseCase } from "../../application/use-cases/technician/auth/RequestTechnicianForgotPasswordOtpUseCase";
import { VerifyTechnicianForgotPasswordOtpUseCase } from "../../application/use-cases/technician/auth/VerifyTechnicianForgotPasswordOtpUseCase";
//logger
import { WinstonLogger } from "../logging/WinstonLogger";

// INFRASTRUCTURE SERVICE INSTANTIATION

const imageService = new S3ImageService();
const otpSessionRepo = new OtpSessionMongoRepository();
const emailService = new NodemailerEmailService();
const passwordHasher = new BcryptPasswordHasher();
const jwtService = new JwtService();
const logger = new WinstonLogger();
const cacheService = new RedisCacheService(redis);
const googleAuthService = new GoogleAuthService(
  process.env.GOOGLE_CLIENT_ID || ""
);

// ZONE MODULE WIRING
const zoneRepo = new ZoneMongoRepository();
const createZoneUseCase = new CreateZoneUseCase(zoneRepo, logger);
const getAllZonesUseCase = new GetAllZonesUseCase(zoneRepo, logger);
const editZoneUseCase = new EditZoneUseCase(zoneRepo, logger);
const deleteZoneUseCase = new DeleteZoneUseCase(zoneRepo, logger);

export const zoneService = new ZoneService(zoneRepo);
const findZoneByLocationUseCase = new FindZoneByLocationUseCase(
  zoneService,
  logger
);
export const customerZoneController = new CustomerZoneController(
  findZoneByLocationUseCase,
  logger
);
export const adminZoneController = new AdminZoneController(
  createZoneUseCase,
  getAllZonesUseCase,
  deleteZoneUseCase,
  editZoneUseCase,
  logger
);

// CATEGORY MODULE WIRING

const categoryRepo = new ServiceCategoryMongoRepository();
const createCategoryUseCase = new CreateCategoryUseCase(
  categoryRepo,
  imageService,
  logger
);
const getAllCategoriesUseCase = new GetAllCategoriesUseCase(
  categoryRepo,
  logger
);
const editCategoryUseCase = new EditCategoryUseCase(
  categoryRepo,
  imageService,
  logger
);

const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepo, logger);

const toggleCategoryStatusUseCase = new ToggleCategoryStatusUseCase(
  categoryRepo,
  logger
);

export const adminCategoryController = new AdminCategoryController(
  createCategoryUseCase,
  getAllCategoriesUseCase,
  editCategoryUseCase,
  deleteCategoryUseCase,
  toggleCategoryStatusUseCase,
  logger
);

// SERVICE ITEM MODULE WIRING

const serviceItemRepo = new ServiceItemMongoRepository();
const createServiceItemUseCase = new CreateServiceItemUseCase(
  serviceItemRepo,
  imageService,
  logger
);
const getAllServiceItemsUseCase = new GetAllServiceItemsUseCase(
  serviceItemRepo,
  logger
);

const deleteServiceItemUseCase = new DeleteServiceItemUseCase(
  serviceItemRepo,
  logger
);
const editServiceItemUseCase = new EditServiceItemUseCase(
  serviceItemRepo,
  imageService,
  logger
);

const toggleServiceItemStatusUseCase = new ToggleServiceItemStatusUseCase(
  serviceItemRepo,
  logger
);

export const adminServiceItemController = new AdminServiceItemController(
  createServiceItemUseCase,
  getAllServiceItemsUseCase,
  deleteServiceItemUseCase,
  editServiceItemUseCase,
  toggleServiceItemStatusUseCase,
  logger
);

// CUSTOMER MODULE WIRING (Admin & Profile)
const addressRepo = new AddressMongoRepository();
const customerRepo = new CustomerMongoRepository();
const getAllCustomersUseCase = new GetAllCustomersUseCase(customerRepo, logger);
const updateCustomerUseCase = new UpdateCustomerUseCase(customerRepo, logger);
const getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepo, logger);
const deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepo, logger);
const getCustomerProfileUseCase = new GetCustomerProfileUseCase(
  customerRepo,
  addressRepo,
  logger
);
const uploadAvatarUseCase = new UploadAvatarUseCase(
  customerRepo,
  imageService,
  logger
);
const changePasswordUseCase = new ChangePasswordUseCase(
  customerRepo,
  passwordHasher,
  logger
);
export const customerProfileController = new CustomerProfileController(
  getCustomerProfileUseCase,
  updateCustomerUseCase,
  deleteCustomerUseCase,
  uploadAvatarUseCase,
  changePasswordUseCase,
  logger
);

const getAddressesUseCase = new GetAddressesUseCase(addressRepo, logger);

export const adminCustomerController = new AdminCustomerController(
  getAllCustomersUseCase,
  updateCustomerUseCase,
  getCustomerByIdUseCase,
  deleteCustomerUseCase,
  getAddressesUseCase,
  logger
);

// CUSTOMER AUTH MODULE WIRING

const reqRegOtpUseCase = new RequestCustomerRegistrationOtpUseCase(
  customerRepo,
  otpSessionRepo,
  emailService,
  logger
);
const verRegOtpUseCase = new VerifyCustomerRegistrationOtpUseCase(
  customerRepo,
  otpSessionRepo,
  passwordHasher,
  jwtService,
  cacheService,
  logger
);
const custLoginUseCase = new CustomerLoginUseCase(
  customerRepo,
  passwordHasher,
  jwtService,
  cacheService,
  logger
);
const reqForgotOtpUseCase = new RequestCustomerForgotPasswordOtpUseCase(
  customerRepo,
  otpSessionRepo,
  emailService,
  logger
);
const verForgotOtpUseCase = new VerifyCustomerForgotPasswordOtpUseCase(
  customerRepo,
  otpSessionRepo,
  passwordHasher,
  logger
);
const googleLoginUseCase = new CustomerGoogleLoginUseCase(
  customerRepo,
  jwtService,
  googleAuthService,
  cacheService,
  logger
);

export const customerAuthController = new CustomerAuthController(
  reqRegOtpUseCase,
  verRegOtpUseCase,
  custLoginUseCase,
  reqForgotOtpUseCase,
  verForgotOtpUseCase,
  googleLoginUseCase,
  logger
);

// CUSTOMER SERVICE MODULE WIRING (Home/Listing)

const getMostBookedUseCase = new GetMostBookedServicesUseCase(
  serviceItemRepo,
  logger
);
const getServiceListingUseCase = new GetServiceListingUseCase(
  serviceItemRepo,
  logger
);
const getServiceByIdUseCase = new GetServiceByIdUseCase(
  serviceItemRepo,
  logger
);

export const customerCategoryController = new CustomerCategoryController(
  getAllCategoriesUseCase,
  logger
);

export const customerServiceController = new CustomerServiceController(
  getMostBookedUseCase,
  getServiceListingUseCase,
  getServiceByIdUseCase,
  logger
);

const addAddressUseCase = new AddAddressUseCase(
  addressRepo,
  zoneService,
  logger
);
const updateAddressUseCase = new UpdateAddressUseCase(
  addressRepo,
  zoneService,
  logger
);
const deleteAddressUseCase = new DeleteAddressUseCase(addressRepo, logger);
export const customerAddressController = new CustomerAddressController(
  addAddressUseCase,
  updateAddressUseCase,
  getAddressesUseCase,
  deleteAddressUseCase,
  logger
);


const technicianRepo = new TechnicianMongoRepository();

const reqTechnicianRegOtpUseCase = new RequestTechnicianRegistrationOtpUseCase(
  technicianRepo,
  otpSessionRepo,
  emailService,
  logger
);
const verTechnicianRegOtpUseCase = new VerifyTechnicianRegistrationOtpUseCase(
  technicianRepo,
  otpSessionRepo,
  passwordHasher,
  jwtService,
  cacheService,
  logger
);
const technicianLoginUseCase = new TechnicianLoginUseCase(
  technicianRepo,
  passwordHasher,
  jwtService,
  cacheService,
  logger
);
const reqTechForgotOtpUseCase = new RequestTechnicianForgotPasswordOtpUseCase(
  technicianRepo,
  otpSessionRepo,
  emailService,
  logger
);

const verTechForgotOtpUseCase = new VerifyTechnicianForgotPasswordOtpUseCase(
  technicianRepo,
  otpSessionRepo,
  passwordHasher,
  logger 
);

export const technicianAuthController = new TechnicianAuthController(
  reqTechnicianRegOtpUseCase,
  verTechnicianRegOtpUseCase,
  technicianLoginUseCase,
  reqTechForgotOtpUseCase,
  verTechForgotOtpUseCase,
  logger
);

// --- ADMIN AUTH MODULE WIRING ---
const adminRepo = new AdminMongoRepository();

const adminLoginUseCase = new AdminLoginUseCase(
  adminRepo,
  passwordHasher,
  jwtService,
  cacheService,
  logger
);

export const adminAuthController = new AdminAuthController(
  adminLoginUseCase,
  logger
);

// TOKEN MANAGEMENT WIRING

const refreshTokenUseCase = new RefreshTokenUseCase(
  jwtService,
  customerRepo,
  technicianRepo,
  cacheService,
  logger
);

export const authTokenController = new AuthTokenController(
  refreshTokenUseCase,
  logger
);

const technicianOnboardingUseCase = new TechnicianOnboardingUseCase(
  technicianRepo, 
  logger          
);

const getTechnicianProfileUseCase = new GetTechnicianProfileUseCase(
  technicianRepo,
  logger
);
const uploadTechnicianFileUseCase = new UploadTechnicianFileUseCase(
  imageService, 
  logger
);

// 2. Instantiate & Export Profile Controller
export const technicianProfileController = new TechnicianProfileController(
  technicianOnboardingUseCase, 
  getTechnicianProfileUseCase, 
  uploadTechnicianFileUseCase,
  logger
);

// --- RATE CARD & DATA MODULE ---

// 3. Instantiate Commission Strategy
const commissionStrategy = new FixedCommissionStrategy();

// 4. Instantiate Rate Card Use Case (Injecting Strategy)
const getTechnicianRateCardUseCase = new GetTechnicianRateCardUseCase(
  technicianRepo,  
  serviceItemRepo, 
  commissionStrategy,
  logger
);

// 5. Instantiate Data Controller (Injecting Use Case)
export const technicianDataController = new TechnicianDataController(
  getAllCategoriesUseCase,
  getServiceListingUseCase,
  getAllZonesUseCase,
  getTechnicianRateCardUseCase, 
  logger
);

const getVerificationQueueUseCase = new GetVerificationQueueUseCase(technicianRepo, logger);

const getTechnicianFullProfileUseCase = new GetTechnicianFullProfileUseCase(technicianRepo, logger);

const verifyTechnicianUseCase = new VerifyTechnicianUseCase(technicianRepo, logger);
const getAllTechniciansUseCase = new GetAllTechniciansUseCase(technicianRepo, logger);
const updateTechnicianUseCase = new UpdateTechnicianUseCase(technicianRepo, logger);
const deleteTechnicianUseCase = new DeleteTechnicianUseCase(technicianRepo, logger);
const blockTechnicianUseCase = new BlockTechnicianUseCase(technicianRepo, logger);
export const adminTechnicianController = new AdminTechnicianController(
  getVerificationQueueUseCase,
  getTechnicianFullProfileUseCase,
  verifyTechnicianUseCase,
  getAllTechniciansUseCase,
  updateTechnicianUseCase, // Edit
  deleteTechnicianUseCase, // Delete
  blockTechnicianUseCase,  // Suspend
  logger
);