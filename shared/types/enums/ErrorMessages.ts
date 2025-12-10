// ERROR MESSAGES
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
  INVALID_QUERY = 'Invalid Query parameters',
  INVALID_DATA = 'Invalid request data provided'
}

// OPTIONAL: machine-readable error codes
export enum ErrorCodes {
  INVALID_CREDENTIALS = "ERR_INVALID_CREDENTIALS",
  NOT_FOUND = "ERR_NOT_FOUND",
  VALIDATION = "ERR_VALIDATION",
  OTP_FAILED = "ERR_OTP_FAILED",
  INTERNAL = "ERR_INTERNAL",
  TOKEN_EXPIRED = "ERR_TOKEN_EXPIRED",
}

// SUCCESS MESSAGES
export enum SuccessMessages {
  LOGIN_SUCCESS = "Logged in successfully",
  LOGOUT_SUCCESS = "Logged out successfully",
  OTP_SENT = "OTP sent successfully",
  PASSWORD_RESET_SUCCESS = "Password reset successfully",
  REGISTRATION_SUCCESS = "Registration completed successfully",
}
