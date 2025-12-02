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

  VALIDATION_ERROR = "Validation failed",
  MISSING_REQUIRED_FIELDS = "Missing required fields",

  INTERNAL_ERROR = "Internal server error",
}
