export enum ErrorMessages { 
  INVALID_CREDENTIALS = "Invalid email or password",
  ADMIN_NOT_FOUND = "Admin not found",
  CUSTOMER_NOT_FOUND = "Customer not found",
  TECHNICIAN_NOT_FOUND = "Technician not found",

  EMAIL_ALREADY_EXISTS = "Email is already registered",
  PHONE_ALREADY_EXISTS = "Phone number is already registered",

  OTP_INVALID = "Invalid OTP",
  OTP_EXPIRED = "OTP has expired",
  OTP_SESSION_INVALID = "Invalid or expired OTP session",

  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden access",
  TOKEN_EXPIRED = "Session expired, please login again",

  VALIDATION_ERROR = "Validation failed",
  MISSING_REQUIRED_FIELDS = "Missing required fields",
  SOMETHING_WRONG = "Something went wrong",

  INTERNAL_ERROR = "Internal server error",
  INVALID_QUERY = "Invalid Query parameters",
  INVALID_DATA = "Invalid request data provided",
  ACCOUNT_BLOCKED = "Your account has been suspended. Please contact support.",
  ADDRESS_NOT_FOUND = "Address not found",
  CATEGORY_NOT_FOUND = "Category not found",
  SERVICE_NOT_FOUND = "Service not found",
  ZONE_NOT_FOUND = "Zone not found",
  INVALID_ZONE = "Invalid Zone Shape: The boundaries cannot cross each other. Please draw a simple loop.",
  GOOGLE_REGISTERED = "You registered using google, Please logout and use forgot password option",
  INVALID_PASSWORD = "Incorrect current password. Please try again.",
  NO_FILE = "No file uploaded",
  ZONE_ALREADY_EXISTS = "Zone with this name already exists",
  ZONE_DELETE_FAILED = "Zone not found or could not be deleted",
  INVALID_BOUNDARIES = "Valid boundaries (at least 3 points) are required",
  SERVICE_ALREADY_EXISTS = "A service with this name already exists",
  INVALID_SPECIFICATIONS = "Invalid format for specifications",
  INVALID_IMAGES = "At least one image is required",
  CATEGORY_ALREADY_EXISTS = "Category with this name already exists",
  INVALID_IS_ACTIVE = "isActive must be a boolean",

  TECH_INVALID_STEP = "Invalid onboarding step",
  TECH_MISSING_CATS = "At least one category and service must be selected",
  TECH_MISSING_ZONES = "At least one operating zone is required",
  TECH_RATE_DISAGREE = "You must agree to the service rates to proceed",
  TECH_DOCS_MISSING = "Mandatory documents (Aadhaar/PAN) are missing",
  TECH_DOC_LIMIT = "Maximum 6 documents allowed",
  TECH_FILE_TOO_LARGE = "File size exceeds limit (5MB)",
  TECH_INVALID_FILE_TYPE = "Invalid file type. Only JPG, PNG, PDF allowed",
  TECH_NOT_VERIFIED = "You must be verified to go online.",
  TECH_LOCATION_REQUIRED = "Location access is required to go online.",
  TECH_OUTSIDE_ZONE = "You are currently outside your selected service zones.",
  PENDING_ZONE_REQUEST = "You already have a pending zone transfer request.",
  PENDING_SERVICE_REQUEST = "A request for this service is already pending approval.",
  DUPLICATE_SERVICE = "This service is already active in your profile.",
  
  REQUEST_NOT_FOUND = "The specific change request was not found or already resolved",
  INVALID_RESOLUTION_ACTION = "Invalid resolution action. Must be APPROVE or REJECT",

  // Booking Errors
  BOOKING_NOT_FOUND = "Booking not found.",
  INVALID_BOOKING_STATUS = "Invalid booking status transition.",
  BOOKING_ALREADY_ASSIGNED = "This booking has already been assigned.",
  BOOKING_EXPIRED = "Booking request has expired.",
  
  ZONE_MISMATCH = "Service is not available in this location.",
  NO_TECHS_AVAILABLE = "No technicians available in your zone at this moment.",
  
  // Payment/Financial
  PAYMENT_REQUIRED = "Payment is required to proceed.",
  PAYMENT_FAILED = "Payment processing failed.",
 
  LOCATION_NOT_SERVED = "Sorry, we do not serve this location yet.",
  PHONE_REQUIRED = "A phone number is required to book. Please update your address with a contact number.",
  OTP_MISSING = "OTP is required to start the job.",
  ADMIN_CUSTOMER_ID_MISSING = "Admin must provide customerId",
  RATING_RANGE_ERROR = "Rating must be between 1 and 5.", 
  ONLY_CUSTOMERS_RATE = "Only customers can rate technicians.",
  PROOF_UPLOAD_FAILED = "Failed to upload proof image",
  ADMINS_ONLY = "Admins only.",
  CANCELLATION_NOT_ALLOWED = "Cancellation is not allowed at this stage.",
  NOT_ACTIVE_CANDIDATE = "You are not the active candidate for this booking.",

  PREFIX_CANCELLED_BY_TECH = "CANCELLED_BY_TECH: ",
  REASON_TECH_CANCELLED_NO_REPLACEMENT = "Tech cancelled & no replacements",
  OTP_INVALID_INPUT = "Invalid OTP. Please ask the customer for the correct 4-digit code.",
  INVALID_TRANSITION_EN_ROUTE = "Cannot mark En Route. Booking must be ACCEPTED first.",
  INVALID_TRANSITION_REACHED = "Cannot mark Reached. Technician must be EN_ROUTE first.",
  INVALID_TRANSITION_START = "Cannot start job. Technician must be at location (REACHED) first.",
  PAYMENT_SIGNATURE_INVALID = "Payment verification failed. Invalid signature.",

  TOO_MANY_OTP_REQUESTS='Too many otp requests try again after some time.'
}

export enum SuccessMessages {
  LOGIN_SUCCESS = "Logged in successfully",
  GOOGLE_LOGIN_SUCCESS = "Google login successful",
  LOGOUT_SUCCESS = "Logged out successfully",
  OTP_SENT = "OTP sent successfully",
  PASSWORD_RESET_SUCCESS = "Password reset successfully",
  CHANGE_PASSWORD_SUCCESS = "Password changed successfully.",
  REGISTRATION_SUCCESS = "Registration completed successfully",
  ADDRESS_ADDED = "Address added successfully!",
  ADDRESS_DELETED = "Address deleted successfully",
  ADDRESS_UPDATED = "Address updated successfully",
  DEFAULT_ADDRESS_UPDATED = "Default address updated",
  ADDRESS_OUTSIDE_ZONE = "Address saved, but it is currently outside our service area.",
  PROFILE_UPDATED = "Profile updated successfully",
  ACCOUNT_DELETED = "Account deleted successfully. We are sorry to see you go.",
  ZONE_CREATED = "Zone created successfully",
  ZONE_UPDATED = "Zone updated successfully",
  ZONE_DELETED = "Zone deleted successfully",
  SERVICE_CREATED = "Service Item created successfully",
  SERVICE_UPDATED = "Service updated successfully",
  SERVICE_DELETED = "Service Item deleted successfully",
  SERVICE_STATUS_UPDATED = "Service status updated successfully",
  CATEGORY_CREATED = "Category created successfully",
  CATEGORY_UPDATED = "Category updated successfully",
  CATEGORY_DELETED = "Category deleted successfully",
  CATEGORY_STATUS_UPDATED = "Category status updated successfully",

  TECH_STEP_SAVED = "Progress saved successfully",
  TECH_PROFILE_SUBMITTED = "Profile submitted for verification",
  TECH_DOC_UPLOADED = "Document uploaded successfully",
  TECH_REQUEST_SUBMITTED = "Request submitted successfully. Pending Admin approval.",

  TECH_UPDATED = "Technician updated successfully",
  TECH_DELETED = "Technician deleted successfully",
  TECH_VERIFIED = "Technician approved successfully",
  TECH_REJECTED = "Technician rejected",
  TECH_SUSPENDED = "Technician suspended",
  TECH_ACTIVATED = "Technician activated",

  TECH_ONLINE = "You are now Online",
  TECH_OFFLINE = "You are now Offline",
  TECH_REQUEST_DISMISSED = "Notification cleared successfully",

  BOOKING_CREATED = "Searching for a technician...",
  BOOKING_ACCEPTED = "Booking confirmed successfully.",
  BOOKING_UPDATED = "Booking status updated.",
  BOOKING_CANCELLED = "Booking cancelled successfully.",
 
  TECH_ASSIGNED_SUCCESS = "Technician assigned successfully.",
  FORCE_STATUS_UPDATED = "Booking status updated successfully.",
  PAYMENT_STATUS_UPDATED = "Payment status updated successfully.",
  ALL_BOOKINGS_FETCHED = "All bookings fetched successfully",
  BOOKINGS_FETCHED = "Bookings fetched successfully",
  HISTORY_FETCHED = "History fetched successfully",
  DETAILS_FETCHED = "Booking details fetched successfully.",
  
  
  
  OTP_VERIFIED_JOB_STARTED = "OTP Verified. Job Started! 🚀",
  BOOKING_REJECTED_NEXT = "Booking rejected. Searching for next candidate...",
  EXTRA_CHARGE_ADDED = "Extra charge added. Waiting for customer approval.",
  CHARGE_RESPONSE_SUCCESS = "Charge response recorded successfully.",
  JOB_COMPLETED_INVOICE = "Job completed. Invoice sent to customer.",
  PAYMENT_VERIFIED = "Payment verified successfully.",
  RATING_SUBMITTED = "Rating submitted successfully.",
  JOB_STATUS_UPDATED = "Job status updated successfully", 
  
}
 
export enum NotificationMessages {
  // Titles
  TITLE_ADMIN_ASSIGNED = "New Job Assigned (Admin) ⚡",
  TITLE_TECH_ASSIGNED = "Technician Assigned",
  TITLE_BOOKING_FAILED = "Booking Failed 😔",
  TITLE_NEW_BOOKING_ADMIN = "New Booking Received 🚨",

  // Bodies
  BODY_ADMIN_ASSIGNED = "Admin has manually assigned a job to you.",
  BODY_TECH_ASSIGNED_SUFFIX = " has been assigned to your request.", // Prepend name
  BODY_NO_TECHS = "Sorry, no technicians are available in your area right now.",
  BODY_NEW_BOOKING_PREFIX = "New request for ", 
  TITLE_EXTRA_CHARGE = "Additional Part Required ⚠️", 
  BODY_EXTRA_CHARGE_PART_1 = "Technician added ",
  BODY_EXTRA_CHARGE_PART_2 = " for ₹",
  BODY_EXTRA_CHARGE_PART_3 = ". Please approve.",

  TITLE_REQUEST_WITHDRAWN = "Request Withdrawn",
  BODY_REQUEST_WITHDRAWN = "Customer cancelled the request.",
  
  TITLE_JOB_CANCELLED = "Job Cancelled",
  BODY_JOB_CANCELLED_TECH = "Customer cancelled the booking. You are now free.",
  
  TITLE_BOOKING_CANCELLED_ADMIN = "Booking Cancelled ❌",
  BODY_BOOKING_CANCELLED_ADMIN_PREFIX = "Customer cancelled booking #",
  TITLE_TECH_ASSIGNED_CUSTOMER = "Technician Assigned! 🎉",
  BODY_TECH_ON_THE_WAY = " is on the way. OTP: ",
  
  TITLE_BOOKING_CONFIRMED_TECH = "Booking Confirmed  ",
  BODY_PROCEED_TO_LOCATION = "Please proceed to the location.",
  
  TITLE_TECH_ASSIGNED_ADMIN = "Technician Assigned  ",
  BODY_TECH_ACCEPTED_BOOKING = " accepted booking #",
  
  BODY_ALL_TECHS_BUSY = "Sorry, all technicians are currently busy. Please try again later.",
  TITLE_JOB_RESUMED = "Job Resumed 🚀",
  BODY_JOB_RESUMED = "Customer responded. Status is now ",
  
  TITLE_STATUS_UPDATED = "Status Updated",
  BODY_STATUS_UPDATED = "Booking status is now ",
  
  TITLE_CHARGE_APPROVED = "Charge Approved  ",
  TITLE_CHARGE_REJECTED = "Charge Rejected ❌",
  
  BODY_CHARGE_APPROVED_PREFIX = "Customer approved ",
  BODY_CHARGE_APPROVED_SUFFIX = ". You can continue.",
  
  BODY_CHARGE_REJECTED_PREFIX = "Customer rejected ",
  BODY_CHARGE_REJECTED_SUFFIX = ". Discuss or skip.",
  
  TITLE_CHARGE_DECISION_ADMIN = "Extra Charge Decision ⚡",
  BODY_CHARGE_DECISION_ADMIN_PREFIX = "Charge ",
  BODY_CHARGE_DECISION_ADMIN_MIDDLE = " for booking #",
  TITLE_TECH_CHANGED = "Technician Changed ⚠️",
  BODY_TECH_EMERGENCY_REASSIGN = "Previous technician had an emergency. Searching for a new one...",
  
  BODY_TECH_CANCEL_NO_CANDIDATES = "Technician cancelled and no other partners are available.",
  
  TITLE_TECH_CANCELLED_ADMIN = "Technician Cancelled ⚠️",
  BODY_TECH_CANCELLED_ADMIN_PREFIX = "Tech ",
  BODY_TECH_CANCELLED_ADMIN_SUFFIX = " cancelled. Re-assigning...",
  TITLE_STATUS_EN_ROUTE = "Technician is on the way! 🚚",
  BODY_STATUS_EN_ROUTE = "Track their live location in the app.",
  
  TITLE_STATUS_REACHED = "Technician has arrived! 📍",
  BODY_STATUS_REACHED = "Please meet the technician at your doorstep.",
  
  TITLE_STATUS_STARTED = "Job Started 🛠️",
  BODY_STATUS_STARTED = "Work has begun. Please keep the OTP handy if requested.",
  
  TITLE_ADMIN_UPDATE = "Booking Update: ",
  TITLE_PAYMENT_RECEIVED = "Payment Received! 💰",
  BODY_PAYMENT_RECEIVED_TECH_SUFFIX = " is fully paid. Great work!",
  
  TITLE_PAYMENT_RECEIVED_ADMIN = "Payment Received 💰",
  BODY_PAYMENT_RECEIVED_ADMIN_SUFFIX = " marked as PAID.",
}