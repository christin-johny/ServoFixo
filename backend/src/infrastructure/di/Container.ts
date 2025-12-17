import { S3ImageService } from "../storage/S3ImageService";

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



// --- Customer Auth---
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

// INFRASTRUCTURE SERVICE INSTANTIATION

const imageService = new S3ImageService();
const otpSessionRepo = new OtpSessionMongoRepository();
const emailService = new NodemailerEmailService();
const passwordHasher = new BcryptPasswordHasher();
const jwtService = new JwtService();

// ZONE MODULE WIRING

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

// CATEGORY MODULE WIRING

const categoryRepo = new ServiceCategoryMongoRepository();
const createCategoryUseCase = new CreateCategoryUseCase(
  categoryRepo,
  imageService
);
const getAllCategoriesUseCase = new GetAllCategoriesUseCase(categoryRepo);
const editCategoryUseCase = new EditCategoryUseCase(categoryRepo, imageService);

const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepo);

const toggleCategoryStatusUseCase = new ToggleCategoryStatusUseCase(
  categoryRepo
);

export const adminCategoryController = new AdminCategoryController(
  createCategoryUseCase,
  getAllCategoriesUseCase,
  editCategoryUseCase,
  deleteCategoryUseCase,
  toggleCategoryStatusUseCase
);

// SERVICE ITEM MODULE WIRING

const serviceItemRepo = new ServiceItemMongoRepository();
const createServiceItemUseCase = new CreateServiceItemUseCase(
  serviceItemRepo,
  imageService
);
const getAllServiceItemsUseCase = new GetAllServiceItemsUseCase(
  serviceItemRepo
);

const deleteServiceItemUseCase = new DeleteServiceItemUseCase(serviceItemRepo);
const editServiceItemUseCase = new EditServiceItemUseCase(
  serviceItemRepo,
  imageService
);

const toggleServiceItemStatusUseCase = new ToggleServiceItemStatusUseCase(
  serviceItemRepo
);

export const adminServiceItemController = new AdminServiceItemController(
  createServiceItemUseCase,
  getAllServiceItemsUseCase,
  deleteServiceItemUseCase,
  editServiceItemUseCase,
  toggleServiceItemStatusUseCase
);

// CUSTOMER MODULE WIRING (Admin & Profile)

const customerRepo = new CustomerMongoRepository();
const getAllCustomersUseCase = new GetAllCustomersUseCase(customerRepo);
const updateCustomerUseCase = new UpdateCustomerUseCase(customerRepo);
const getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepo);
const deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepo);

export const customerProfileController = new CustomerProfileController(
  getCustomerByIdUseCase
);

export const adminCustomerController = new AdminCustomerController(
  getAllCustomersUseCase,
  updateCustomerUseCase,
  getCustomerByIdUseCase,
  deleteCustomerUseCase
);

// CUSTOMER AUTH MODULE WIRING

const reqRegOtpUseCase = new RequestCustomerRegistrationOtpUseCase(
  customerRepo,
  otpSessionRepo,
  emailService
);
const verRegOtpUseCase = new VerifyCustomerRegistrationOtpUseCase(
  customerRepo,
  otpSessionRepo,
  passwordHasher,
  jwtService
);
const custLoginUseCase = new CustomerLoginUseCase(
  customerRepo,
  passwordHasher,
  jwtService
);
const reqForgotOtpUseCase = new RequestCustomerForgotPasswordOtpUseCase(
  customerRepo,
  otpSessionRepo,
  emailService
);
const verForgotOtpUseCase = new VerifyCustomerForgotPasswordOtpUseCase(
  customerRepo,
  otpSessionRepo,
  passwordHasher
);
const googleLoginUseCase = new CustomerGoogleLoginUseCase(
  customerRepo,
  jwtService,
  process.env.GOOGLE_CLIENT_ID || ""
);

export const customerAuthController = new CustomerAuthController(
  reqRegOtpUseCase,
  verRegOtpUseCase,
  custLoginUseCase,
  reqForgotOtpUseCase,
  verForgotOtpUseCase,
  googleLoginUseCase
);

// CUSTOMER SERVICE MODULE WIRING (Home/Listing)

const getMostBookedUseCase = new GetMostBookedServicesUseCase(serviceItemRepo);
const getServiceListingUseCase = new GetServiceListingUseCase(serviceItemRepo);
const getServiceByIdUseCase = new GetServiceByIdUseCase(serviceItemRepo);

export const customerCategoryController = new CustomerCategoryController(
  getAllCategoriesUseCase
);

export const customerServiceController = new CustomerServiceController(
  getMostBookedUseCase,
  getServiceListingUseCase,
  getServiceByIdUseCase
);

// --- ADMIN AUTH MODULE WIRING ---
const adminRepo = new AdminMongoRepository();

const adminLoginUseCase = new AdminLoginUseCase(
  adminRepo,
  passwordHasher, 
  jwtService     
);

export const adminAuthController = new AdminAuthController(adminLoginUseCase);


// TOKEN MANAGEMENT WIRING

const refreshTokenUseCase = new RefreshTokenUseCase(jwtService, customerRepo);

export const authTokenController = new AuthTokenController(refreshTokenUseCase);