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

import { UpdateTechnicianUseCase } from "../../application/use-cases/technician/management/UpdateTechnicianUseCase";
import { BlockTechnicianUseCase } from "../../application/use-cases/technician/management/BlockTechnicianUseCase";
import { DeleteTechnicianUseCase } from "../../application/use-cases/technician/management/DeleteTechnicianUseCase";
import { ToggleOnlineStatusUseCase } from "../../application/use-cases/technician/profile/ToggleOnlineStatusUseCase";
import { ResubmitProfileUseCase } from "../../application/use-cases/technician/profile/ResubmitProfileUseCase";

import { TechnicianOnboardingUseCase } from "../../application/use-cases/technician/profile/TechnicianOnboardingUseCase";
import { GetTechnicianProfileUseCase } from "../../application/use-cases/technician/profile/GetTechnicianProfileUseCase";
import { TechnicianProfileController } from "../../presentation/controllers/Technician/TechnicianProfileController";
import { UploadTechnicianFileUseCase } from "../../application/use-cases/technician/profile/UploadTechnicianFileUseCase";
import { GetVerificationQueueUseCase } from "../../application/use-cases/technician/management/GetVerificationQueueUseCase";
import { AdminTechnicianController } from "../../presentation/controllers/Admin/AdminTechnicianController";
import { GetTechnicianFullProfileUseCase } from "../../application/use-cases/technician/profile/GetTechnicianFullProfileUseCase";
import { VerifyTechnicianUseCase } from "../../application/use-cases/technician/management/VerifyTechnicianUseCase";
import { GetAllTechniciansUseCase } from "../../application/use-cases/technician/management/GetAllTechniciansUseCase";
import { RequestServiceAddUseCase } from "../../application/use-cases/technician/profile/RequestServiceAddUseCase";
import { RequestZoneTransferUseCase } from "../../application/use-cases/technician/profile/RequestZoneTransferUseCase";
import { RequestBankUpdateUseCase } from "../../application/use-cases/technician/profile/RequestBankUpdateUseCase";
import { DismissTechnicianRequestUseCase } from "../../application/use-cases/technician/management/DismissTechnicianRequestUseCase";
import { ResolveServiceRequestUseCase } from "../../application/use-cases/technician/management/ResolveServiceRequestUseCase";
import { ResolveZoneRequestUseCase } from "../../application/use-cases/technician/management/ResolveZoneRequestUseCase";
import { ResolveBankRequestUseCase } from "../../application/use-cases/technician/management/ResolveBankRequestUseCase";
// --- Admin Auth---
import { AdminLoginUseCase } from "../../application/use-cases/auth/AdminLoginUseCase";
import { AdminAuthController } from "../../presentation/controllers/Admin/AdminAuthController";
import { AdminMongoRepository } from "../database/repositories/AdminMongoRepository";

// --- Infrastructure Services ---

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

// --- Notification Module ---
import { NotificationMongoRepository } from "../database/repositories/NotificationMongoRepository";
import { NotificationService } from "../services/NotificationService"; 
import { GetNotificationHistoryUseCase } from "../../application/use-cases/notification/GetNotificationHistoryUseCase";
import { TechnicianNotificationController } from "../../presentation/controllers/Technician/TechnicianNotificationController";
import { MarkNotificationAsReadUseCase } from "../../application/use-cases/notification/MarkNotificationAsReadUseCase";
import { MarkAllNotificationsAsReadUseCase } from "../../application/use-cases/notification/MarkAllNotificationsAsReadUseCase";

//Booking 
// --- Booking Module ---
import { BookingMongoRepository } from "../database/repositories/BookingMongoRepository";
import { CreateBookingUseCase } from "../../application/use-cases/booking/CreateBookingUseCase";
import { RespondToBookingUseCase } from "../../application/use-cases/booking/RespondToBookingUseCase";
import { BookingController } from "../../presentation/controllers/Booking/BookingController";
import { UpdateJobStatusUseCase } from "../../application/use-cases/booking/UpdateJobStatusUseCase";
import { AddExtraChargeUseCase } from "../../application/use-cases/booking/AddExtraChargeUseCase";
import { RespondToExtraChargeUseCase } from "../../application/use-cases/booking/RespondToExtraChargeUseCase";
import { CompleteJobUseCase } from "../../application/use-cases/booking/CompleteJobUseCase";
import { RazorpayService } from "../payments/RazorpayService";
import { GetBookingDetailsUseCase } from "../../application/use-cases/booking/GetBookingDetailsUseCase";
import { AdminForceAssignUseCase } from "../../application/use-cases/booking/AdminForceAssignUseCase";
import { AdminBookingController } from "../../presentation/controllers/Admin/AdminBookingController";
import { CustomerCancelBookingUseCase } from "../../application/use-cases/booking/CustomerCancelBookingUseCase";
import { TechnicianCancelBookingUseCase } from "../../application/use-cases/booking/TechnicianCancelBookingUseCase";
import { ProcessPaymentUseCase } from "../../application/use-cases/webhook/ProcessPaymentUseCase";
import { PaymentWebhookController } from "../../presentation/controllers/webhook/PaymentWebhookController";
import { ReviewMongoRepository } from "../database/repositories/ReviewMongoRepository";
import { RateTechnicianUseCase } from "../../application/use-cases/booking/RateTechnicianUseCase";
import { AdminForceStatusUseCase } from "../../application/use-cases/booking/AdminForceStatusUseCase";
import { AdminUpdatePaymentUseCase } from "../../application/use-cases/booking/AdminUpdatePaymentUseCase";
import { GetTechnicianHistoryUseCase } from "../../application/use-cases/booking/GetTechnicianHistoryUseCase";
import { GetCustomerBookingsUseCase } from "../../application/use-cases/booking/GetCustomerBookingsUseCase";
import { VerifyPaymentUseCase } from "../../application/use-cases/booking/VerifyPaymentUseCase";
import { GetServiceReviewsUseCase } from "../../application/use-cases/service-items/GetServiceReviewsUseCase";
import { GetAllBookingsUseCase } from "../../application/use-cases/booking/GetAllBookingsUseCase";
import { GetRecommendedTechniciansUseCase } from "../../application/use-cases/booking/GetRecommendedTechniciansUseCase";
import { RedisOtpSessionRepository } from "../redis/RedisOtpSessionRepository";
 

import { ChatSessionMongoRepository } from "../database/repositories/ChatSessionMongoRepository";
import { GeminiChatService } from "../services/GeminiChatService";
import { StartChatSessionUseCase } from "../../application/use-cases/chat/StartChatSessionUseCase";
import { SendChatMessageUseCase } from "../../application/use-cases/chat/SendChatMessageUseCase";
import { GetChatHistoryUseCase } from "../../application/use-cases/chat/GetChatHistoryUseCase";
import { ResolveChatUseCase } from "../../application/use-cases/chat/ResolveChatUseCase";
import { ChatController } from "../../presentation/controllers/Chat/ChatController";


const imageService = new S3ImageService();
const emailService = new NodemailerEmailService();
const passwordHasher = new BcryptPasswordHasher();
const jwtService = new JwtService();
const paymentGateway = new RazorpayService();
export const logger = new WinstonLogger();
const cacheService = new RedisCacheService(redis);
const googleAuthService = new GoogleAuthService(
  process.env.GOOGLE_CLIENT_ID || ""
);
const otpSessionRepo = new RedisOtpSessionRepository(cacheService);
const zoneRepo = new ZoneMongoRepository();
const createZoneUseCase  = new CreateZoneUseCase(zoneRepo, logger);
const getAllZonesUseCase = new GetAllZonesUseCase(zoneRepo, logger);
const editZoneUseCase = new EditZoneUseCase(zoneRepo, logger);
const deleteZoneUseCase = new DeleteZoneUseCase(zoneRepo, logger);

export const zoneService = new ZoneService(zoneRepo);

const findZoneByLocationUseCase = new FindZoneByLocationUseCase(zoneService );

export const customerZoneController = new CustomerZoneController(findZoneByLocationUseCase,logger);

export const adminZoneController = new AdminZoneController(createZoneUseCase,getAllZonesUseCase,deleteZoneUseCase,editZoneUseCase,logger);

const categoryRepo = new ServiceCategoryMongoRepository();
const createCategoryUseCase = new CreateCategoryUseCase(categoryRepo,imageService,logger);
const getAllCategoriesUseCase = new GetAllCategoriesUseCase(categoryRepo, );
const editCategoryUseCase = new EditCategoryUseCase(categoryRepo,imageService,logger);
const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepo, logger);
const toggleCategoryStatusUseCase = new ToggleCategoryStatusUseCase(categoryRepo,logger);

export const adminCategoryController = new AdminCategoryController( createCategoryUseCase, getAllCategoriesUseCase, editCategoryUseCase, deleteCategoryUseCase, toggleCategoryStatusUseCase, logger);

const serviceItemRepo = new ServiceItemMongoRepository();
const createServiceItemUseCase = new CreateServiceItemUseCase( serviceItemRepo, imageService, logger);
const getAllServiceItemsUseCase = new GetAllServiceItemsUseCase( serviceItemRepo, );
const deleteServiceItemUseCase = new DeleteServiceItemUseCase( serviceItemRepo, logger);
const editServiceItemUseCase = new EditServiceItemUseCase( serviceItemRepo, imageService, logger);
const toggleServiceItemStatusUseCase = new ToggleServiceItemStatusUseCase( serviceItemRepo, logger);

export const adminServiceItemController = new AdminServiceItemController( createServiceItemUseCase, getAllServiceItemsUseCase, deleteServiceItemUseCase, editServiceItemUseCase, toggleServiceItemStatusUseCase, logger);
 
const addressRepo = new AddressMongoRepository();
const customerRepo = new CustomerMongoRepository();
const getAllCustomersUseCase = new GetAllCustomersUseCase(customerRepo );
const updateCustomerUseCase = new UpdateCustomerUseCase(customerRepo, logger);
const getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepo, logger);
const deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepo );
const getCustomerProfileUseCase = new GetCustomerProfileUseCase( customerRepo,  logger);
const uploadAvatarUseCase = new UploadAvatarUseCase( customerRepo, imageService);
const changePasswordUseCase = new ChangePasswordUseCase( customerRepo, passwordHasher, logger);

export const customerProfileController = new CustomerProfileController( getCustomerProfileUseCase, updateCustomerUseCase, deleteCustomerUseCase, uploadAvatarUseCase, changePasswordUseCase);

const getAddressesUseCase = new GetAddressesUseCase(addressRepo, logger);

export const adminCustomerController = new AdminCustomerController( getAllCustomersUseCase,updateCustomerUseCase,getCustomerByIdUseCase, deleteCustomerUseCase, getAddressesUseCase, logger);

const reqRegOtpUseCase = new RequestCustomerRegistrationOtpUseCase( customerRepo,otpSessionRepo, emailService, logger);
const verRegOtpUseCase = new VerifyCustomerRegistrationOtpUseCase( customerRepo, otpSessionRepo, passwordHasher, jwtService, cacheService, logger);
const custLoginUseCase = new CustomerLoginUseCase(  customerRepo, passwordHasher, jwtService, cacheService, logger);
const reqForgotOtpUseCase = new RequestCustomerForgotPasswordOtpUseCase( customerRepo, otpSessionRepo, emailService, logger);
const verForgotOtpUseCase = new VerifyCustomerForgotPasswordOtpUseCase( customerRepo,  otpSessionRepo,  passwordHasher, logger);
const googleLoginUseCase = new CustomerGoogleLoginUseCase( customerRepo,jwtService, googleAuthService, cacheService, logger);

export const customerAuthController = new CustomerAuthController( reqRegOtpUseCase, verRegOtpUseCase, custLoginUseCase,reqForgotOtpUseCase,  verForgotOtpUseCase,  googleLoginUseCase, logger);

const getMostBookedUseCase = new GetMostBookedServicesUseCase( serviceItemRepo, );
const getServiceListingUseCase = new GetServiceListingUseCase( serviceItemRepo, );
const getServiceByIdUseCase = new GetServiceByIdUseCase( serviceItemRepo, logger);

export const customerCategoryController = new CustomerCategoryController( getAllCategoriesUseCase, logger);

const reviewRepo = new ReviewMongoRepository();
const getServiceReviewsUseCase = new GetServiceReviewsUseCase(reviewRepo);

export const customerServiceController = new CustomerServiceController( getMostBookedUseCase, getServiceListingUseCase, getServiceByIdUseCase, getServiceReviewsUseCase, logger);

const addAddressUseCase = new AddAddressUseCase( addressRepo, zoneService, logger);
const updateAddressUseCase = new UpdateAddressUseCase( addressRepo, zoneService, logger);
const deleteAddressUseCase = new DeleteAddressUseCase(addressRepo, logger);

export const customerAddressController = new CustomerAddressController(addAddressUseCase, updateAddressUseCase, getAddressesUseCase, deleteAddressUseCase, logger);

export const technicianRepo = new TechnicianMongoRepository();

const reqTechnicianRegOtpUseCase = new RequestTechnicianRegistrationOtpUseCase( technicianRepo, otpSessionRepo, emailService, logger);
const verTechnicianRegOtpUseCase = new VerifyTechnicianRegistrationOtpUseCase( technicianRepo, otpSessionRepo, passwordHasher, jwtService, cacheService, logger);
const technicianLoginUseCase = new TechnicianLoginUseCase( technicianRepo, passwordHasher,jwtService, cacheService, logger);
const reqTechForgotOtpUseCase = new RequestTechnicianForgotPasswordOtpUseCase( technicianRepo, otpSessionRepo, emailService, logger);
const verTechForgotOtpUseCase = new VerifyTechnicianForgotPasswordOtpUseCase( technicianRepo,otpSessionRepo, passwordHasher, logger);

export const technicianAuthController = new TechnicianAuthController( reqTechnicianRegOtpUseCase, verTechnicianRegOtpUseCase, technicianLoginUseCase, reqTechForgotOtpUseCase, verTechForgotOtpUseCase, logger);

const adminRepo = new AdminMongoRepository();
const adminLoginUseCase = new AdminLoginUseCase( adminRepo, passwordHasher, jwtService, cacheService, logger);

export const adminAuthController = new AdminAuthController( adminLoginUseCase, logger);

const refreshTokenUseCase = new RefreshTokenUseCase( jwtService, customerRepo, cacheService, technicianRepo, logger);

export const authTokenController = new AuthTokenController(refreshTokenUseCase);

const technicianOnboardingUseCase = new TechnicianOnboardingUseCase( technicianRepo,logger);
const getTechnicianProfileUseCase = new GetTechnicianProfileUseCase( technicianRepo, categoryRepo, serviceItemRepo,zoneRepo, logger);
const uploadTechnicianFileUseCase = new UploadTechnicianFileUseCase( imageService);
const toggleOnlineStatusUseCase = new ToggleOnlineStatusUseCase( technicianRepo, logger);
const resubmitProfileUseCase = new ResubmitProfileUseCase( technicianRepo);
const requestServiceAddUseCase = new RequestServiceAddUseCase( technicianRepo, logger);
const requestZoneTransferUseCase = new RequestZoneTransferUseCase( technicianRepo);
const requestBankUpdateUseCase = new RequestBankUpdateUseCase( technicianRepo);
const dismissTechnicianRequestUseCase = new DismissTechnicianRequestUseCase( technicianRepo, logger);

export const technicianProfileController = new TechnicianProfileController(technicianOnboardingUseCase, getTechnicianProfileUseCase, uploadTechnicianFileUseCase,toggleOnlineStatusUseCase, resubmitProfileUseCase, requestServiceAddUseCase,  requestZoneTransferUseCase, requestBankUpdateUseCase,  dismissTechnicianRequestUseCase, logger);

const commissionStrategy = new FixedCommissionStrategy();
const getTechnicianRateCardUseCase = new GetTechnicianRateCardUseCase( technicianRepo, serviceItemRepo, commissionStrategy, logger);

export const technicianDataController = new TechnicianDataController(  getAllCategoriesUseCase,  getServiceListingUseCase,  getAllZonesUseCase,  getTechnicianRateCardUseCase,  logger);

const getVerificationQueueUseCase = new GetVerificationQueueUseCase(technicianRepo);
const getTechnicianFullProfileUseCase = new GetTechnicianFullProfileUseCase(  technicianRepo,  zoneRepo,  categoryRepo,  serviceItemRepo);
const verifyTechnicianUseCase = new VerifyTechnicianUseCase(  technicianRepo);
const getAllTechniciansUseCase = new GetAllTechniciansUseCase(  technicianRepo);
const updateTechnicianUseCase = new UpdateTechnicianUseCase(technicianRepo
);
const deleteTechnicianUseCase = new DeleteTechnicianUseCase(  technicianRepo);
const blockTechnicianUseCase = new BlockTechnicianUseCase(  technicianRepo);
const notificationRepo = new NotificationMongoRepository();

export const notificationService = new NotificationService(  notificationRepo,  logger);

const getNotificationHistoryUseCase = new GetNotificationHistoryUseCase(  notificationRepo);
const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(  notificationRepo);
const markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(  notificationRepo);

export const technicianNotificationController =  new TechnicianNotificationController(  getNotificationHistoryUseCase,    markNotificationAsReadUseCase,    markAllNotificationsAsReadUseCase);

const resolveServiceRequestUseCase = new ResolveServiceRequestUseCase(  technicianRepo,  notificationService,logger);
const resolveZoneRequestUseCase = new ResolveZoneRequestUseCase(  technicianRepo,  notificationService,  logger);
const resolveBankRequestUseCase = new ResolveBankRequestUseCase( technicianRepo,  notificationService,logger);
const getRecommendedTechniciansUseCase = new GetRecommendedTechniciansUseCase(technicianRepo)

export const adminTechnicianController = new AdminTechnicianController(getVerificationQueueUseCase,  getTechnicianFullProfileUseCase,  verifyTechnicianUseCase,  getAllTechniciansUseCase,  updateTechnicianUseCase,  deleteTechnicianUseCase,  blockTechnicianUseCase,  resolveServiceRequestUseCase,  resolveZoneRequestUseCase,  resolveBankRequestUseCase,  getRecommendedTechniciansUseCase,logger);
 
export const bookingRepo = new BookingMongoRepository();
 
const createBookingUseCase = new CreateBookingUseCase(bookingRepo,customerRepo,     serviceItemRepo,  technicianRepo, notificationService,  zoneService );
const respondToBookingUseCase = new RespondToBookingUseCase(bookingRepo,technicianRepo,notificationService,logger)
const updateJobStatusUseCase = new UpdateJobStatusUseCase(bookingRepo,notificationService,logger);
const addExtraChargeUseCase = new AddExtraChargeUseCase(bookingRepo,notificationService,imageService )
const respondToExtraChargeUseCase = new RespondToExtraChargeUseCase(  bookingRepo,  notificationService )
const completeJobUseCase = new CompleteJobUseCase(bookingRepo,paymentGateway,  notificationService,imageService,serviceItemRepo )
const getBookingDetailsUseCase = new GetBookingDetailsUseCase(bookingRepo);
const customerCancelUseCase = new CustomerCancelBookingUseCase(bookingRepo, technicianRepo, notificationService, logger);
const technicianCancelUseCase = new TechnicianCancelBookingUseCase(bookingRepo,technicianRepo, notificationService, logger);
const rateTechnicianUseCase = new RateTechnicianUseCase(bookingRepo,technicianRepo,reviewRepo, serviceItemRepo );
const getTechnicianHistoryUseCase = new GetTechnicianHistoryUseCase(bookingRepo )
const getCustomerBookingsUseCase = new GetCustomerBookingsUseCase(bookingRepo)
const paymentService = new RazorpayService();
const verifyPaymentUseCase = new VerifyPaymentUseCase(bookingRepo,  technicianRepo,  paymentService,  notificationService );

export const bookingController = new BookingController(  createBookingUseCase,  respondToBookingUseCase,  updateJobStatusUseCase,  addExtraChargeUseCase,  respondToExtraChargeUseCase,  completeJobUseCase,  getBookingDetailsUseCase, customerCancelUseCase,  technicianCancelUseCase,  rateTechnicianUseCase, getTechnicianHistoryUseCase,  getCustomerBookingsUseCase,  verifyPaymentUseCase,  logger);

const adminForceAssignUseCase = new AdminForceAssignUseCase(  bookingRepo,  technicianRepo,notificationService,logger);
const adminForceStatusUseCase = new AdminForceStatusUseCase(bookingRepo,technicianRepo, notificationService );
const adminUpdatePaymentUseCase = new AdminUpdatePaymentUseCase(bookingRepo );
const getAllBookingsUseCase = new GetAllBookingsUseCase(bookingRepo)

export const adminBookingController = new AdminBookingController(adminForceAssignUseCase,adminForceStatusUseCase, adminUpdatePaymentUseCase,getAllBookingsUseCase,logger);

const processPaymentUseCase = new ProcessPaymentUseCase(bookingRepo,technicianRepo,notificationService,logger);

export const paymentWebhookController = new PaymentWebhookController(processPaymentUseCase);

const chatRepo = new ChatSessionMongoRepository();
const geminiChatService = new GeminiChatService();
const startChatSessionUseCase = new StartChatSessionUseCase(chatRepo);
const sendChatMessageUseCase = new SendChatMessageUseCase(chatRepo,geminiChatService);
const getChatHistoryUseCase = new GetChatHistoryUseCase(chatRepo);
const resolveChatUseCase = new ResolveChatUseCase(chatRepo,geminiChatService)

export const chatController =  new ChatController(startChatSessionUseCase,sendChatMessageUseCase,getChatHistoryUseCase,resolveChatUseCase,logger)
