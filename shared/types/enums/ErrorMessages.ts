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

  INTERNAL_ERROR = "Internal server error",
  INVALID_QUERY = "Invalid Query parameters",
  INVALID_DATA = "Invalid request data provided",
  ACCOUNT_BLOCKED = "Your account has been suspended. Please contact support.",
  ADDRESS_NOT_FOUND ="Address not found",
  CATEGORY_NOT_FOUND = 'Category not found',
  SERVICE_NOT_FOUND = 'Service not found',
  ZONE_NOT_FOUND = 'Zone not found',
  INVALID_ZONE =  "Invalid Zone Shape: The boundaries cannot cross each other. Please draw a simple loop.",
  

}

export enum ErrorCodes {
  INVALID_CREDENTIALS = "ERR_INVALID_CREDENTIALS",
  NOT_FOUND = "ERR_NOT_FOUND",
  VALIDATION = "ERR_VALIDATION",
  OTP_FAILED = "ERR_OTP_FAILED",
  INTERNAL = "ERR_INTERNAL",
  TOKEN_EXPIRED = "ERR_TOKEN_EXPIRED",
}
 
export enum SuccessMessages {
  LOGIN_SUCCESS = "Logged in successfully",
  GOOGLE_LOGIN_SUCCESS = "Google login successful",
  LOGOUT_SUCCESS = "Logged out successfully",
  OTP_SENT = "OTP sent successfully",
  PASSWORD_RESET_SUCCESS = "Password reset successfully",
  REGISTRATION_SUCCESS = "Registration completed successfully",
  ADDRESS_ADDED ="Address updated successfully" ,
  ADDRESS_DELETED = "Address deleted successfully",
  ADDRESS_UPDATED ="Address updated successfully",
  DEFAULT_ADDRESS_UPDATED="Default address updated",
  

}
