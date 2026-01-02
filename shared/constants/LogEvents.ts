export const LogEvents = {
  // ==========================
  // AUTH MODULE
  // ==========================
  AUTH_LOGIN_INIT: 'Login Initiated',
  AUTH_LOGIN_SUCCESS: 'Login Successful',
  AUTH_LOGIN_FAILED: 'Login Failed',

  AUTH_REGISTER_INIT: 'Registration Initiated',
  AUTH_REGISTER_SUCCESS: 'Registration Successful',
  AUTH_REGISTER_FAILED: 'Registration Failed',

  AUTH_LOGOUT_SUCCESS: 'Logout Successful',
  AUTH_LOGOUT_FAILED: 'Logout Failed', 

  AUTH_REFRESH_INIT: 'Token Refresh Initiated',
  AUTH_REFRESH_SUCCESS: 'Token Refresh Successful',
  AUTH_REFRESH_FAILED: 'Token Refresh Failed',

  AUTH_OTP_REQUEST_INIT: 'OTP Request Initiated',
  AUTH_OTP_SENT: 'OTP Sent Successfully',
  AUTH_OTP_INIT_FAILED: 'OTP Initialization Failed', 

  AUTH_OTP_VERIFY_INIT: 'OTP Verification Initiated',
  AUTH_OTP_VERIFY_SUCCESS: 'OTP Verified Successfully',
  AUTH_OTP_VERIFY_FAILED: 'OTP Verification Failed',

  AUTH_GOOGLE_LOGIN_INIT: 'Google Login Initiated',
  AUTH_GOOGLE_LOGIN_SUCCESS: 'Google Login Successful',
  AUTH_GOOGLE_LOGIN_FAILED: 'Google Login Failed', 
  AUTH_GOOGLE_CALLBACK_FAILED: 'Google Login Callback Failed', 

  AUTH_FORGOT_PASSWORD_INIT: 'Forgot Password Initiated',
  AUTH_FORGOT_PASS_INIT_FAILED: 'Forgot Password OTP Init Failed', 
  AUTH_FORGOT_PASS_VERIFY_FAILED: 'Forgot Password Verification Failed', 
  
  AUTH_PASSWORD_RESET_SUCCESS: 'Password Reset Successful',

  // ==========================
  // CUSTOMER PROFILE MODULE
  // ==========================
  PROFILE_FETCH_INIT: 'Fetching Customer Profile',
  PROFILE_FETCH_FAILED: 'Failed to Fetch Profile',

  PROFILE_UPDATE_INIT: 'Profile Update Initiated',
  PROFILE_UPDATED: 'Profile Updated Successfully',
  PROFILE_UPDATE_FAILED: 'Profile Update Failed',

  PASSWORD_CHANGE_INIT: 'Password Change Initiated',
  PASSWORD_CHANGE_SUCCESS: 'Password Change Successful',
  PASSWORD_CHANGE_FAILED: 'Password Change Failed',

  ACCOUNT_DELETE_INIT: 'Account Deletion Initiated',
  ACCOUNT_DELETE_SUCCESS: 'Account Deletion Successful',
  ACCOUNT_DELETE_FAILED: 'Account Deletion Failed',

  AVATAR_UPLOAD_INIT: 'Avatar Upload Initiated',
  AVATAR_UPLOAD_SUCCESS: 'Avatar Upload Successful',
  AVATAR_UPLOAD_FAILED: 'Avatar Upload Failed',

  // ==========================
  // ZONE MODULE
  // ==========================
  ZONE_CREATE_INIT: 'Zone Creation Initiated',
  ZONE_CREATED: 'Zone Created Successfully',
  ZONE_CREATE_FAILED: 'Zone Creation Failed',

  ZONE_GET_ALL_INIT: 'Fetching All Zones',
  ZONE_GET_ALL_ERROR: 'Error Fetching Zones',

  ZONE_UPDATE_INIT: 'Zone Update Initiated',
  ZONE_UPDATE_SUCCESS: 'Zone Updated Successfully',
  ZONE_UPDATE_FAILED: 'Zone Update Failed',

  ZONE_DELETE_INIT: 'Zone Delete Initiated',
  ZONE_DELETE_SUCCESS: 'Zone Deleted Successfully',
  ZONE_DELETE_FAILED: 'Zone Delete Failed',

  ZONE_NOT_FOUND: 'Zone Not Found',
  ZONE_ALREADY_EXISTS: 'Zone Already Exists',

  ZONE_SERVICEABILITY_CHECK_INIT: 'Checking Zone Serviceability',
  ZONE_SERVICEABILITY_CHECK_SUCCESS: 'Serviceability Check Completed',

  ZONE_FIND_BY_LOC_INIT: 'Find Zone by Location Initiated',
  ZONE_FIND_FAILED: 'Find Zone by Location Failed',

  // ==========================
  // ADDRESS MODULE
  // ==========================
  ADDRESS_ADD_INIT: 'Address Creation Initiated',
  ADDRESS_ADDED: 'Address Added Successfully',
  ADDRESS_ADD_FAILED: 'Address Creation Failed',

  ADDRESS_UPDATE_INIT: 'Address Update Initiated',
  ADDRESS_UPDATED: 'Address Updated Successfully',
  ADDRESS_UPDATE_FAILED: 'Address Update Failed',

  ADDRESS_DELETE_INIT: 'Address Delete Initiated',
  ADDRESS_DELETED: 'Address Deleted Successfully',
  ADDRESS_DELETE_FAILED: 'Address Delete Failed',

  ADDRESS_FETCH_ALL: 'Fetching All Customer Addresses',
  ADDRESS_FETCH_FAILED: 'Failed to Fetch Addresses',

  ADDRESS_SET_DEFAULT: 'Address Set as Default',
  ADDRESS_NOT_FOUND: 'Address Not Found',

  // ==========================
  // CATEGORY MODULE
  // ==========================
  CATEGORY_CREATE_INIT: 'Category Creation Initiated',
  CATEGORY_CREATED: 'Category Created Successfully',
  CATEGORY_CREATE_FAILED: 'Category Creation Failed',

  CATEGORY_GET_ALL_INIT: 'Fetching All Categories',
  CATEGORY_GET_ALL_ERROR: 'Error Fetching Categories',

  CATEGORY_UPDATE_INIT: 'Category Update Initiated',
  CATEGORY_UPDATED: 'Category Updated Successfully',
  CATEGORY_UPDATE_FAILED: 'Category Update Failed',

  CATEGORY_DELETE_INIT: 'Category Delete Initiated',
  CATEGORY_DELETED: 'Category Deleted Successfully',
  CATEGORY_DELETE_FAILED: 'Category Delete Failed',

  CATEGORY_TOGGLE_STATUS_INIT: 'Category Status Toggle Initiated',
  CATEGORY_TOGGLE_STATUS_SUCCESS: 'Category Status Toggled Successfully',
  CATEGORY_TOGGLE_STATUS_FAILED: 'Category Status Toggle Failed',

  CATEGORY_NOT_FOUND: 'Category Not Found',
  CATEGORY_ALREADY_EXISTS: 'Category Already Exists',

  CATEGORY_IMAGE_UPLOAD_SUCCESS: 'Category Image Uploaded Successfully',
  CATEGORY_IMAGE_DELETE_FAILED: 'Failed to Delete Old Category Image',

  // ==========================
  // SERVICE MODULE
  // ==========================
  SERVICE_CREATE_INIT: 'Service Creation Initiated',
  SERVICE_CREATED: 'Service Created Successfully',
  SERVICE_CREATE_FAILED: 'Service Creation Failed',

  SERVICE_GET_ALL_INIT: 'Fetching All Services',
  SERVICE_GET_ALL_ERROR: 'Error Fetching Services',

  SERVICE_UPDATE_INIT: 'Service Update Initiated',
  SERVICE_UPDATED: 'Service Updated Successfully',
  SERVICE_UPDATE_FAILED: 'Service Update Failed',

  SERVICE_DELETE_INIT: 'Service Delete Initiated',
  SERVICE_DELETED: 'Service Deleted Successfully',
  SERVICE_DELETE_FAILED: 'Service Delete Failed',

  SERVICE_TOGGLE_STATUS_INIT: 'Service Status Toggle Initiated',
  SERVICE_TOGGLE_STATUS_SUCCESS: 'Service Status Toggled Successfully',
  SERVICE_TOGGLE_STATUS_FAILED: 'Service Status Toggle Failed',

  SERVICE_NOT_FOUND: 'Service Item Not Found',
  SERVICE_ALREADY_EXISTS: 'Service Item Already Exists',

  SERVICE_IMAGE_UPLOAD_SUCCESS: 'Service Images Uploaded',
  SERVICE_IMAGE_DELETE_FAILED: 'Failed to Delete Old Service Images',

  SERVICE_MOST_BOOKED_FETCH: 'Fetching Most Booked Services',
  SERVICE_LISTING_FETCH: 'Fetching Service Listing with Filters',
  SERVICE_BY_ID_FETCH: 'Fetching Service By ID',
  SERVICE_FETCH_FAILED: 'Failed to Fetch Service Data',

  // ==========================
  // ADMIN CUSTOMER MODULE
  // ==========================
  ADMIN_CUSTOMER_FETCH_ALL_INIT: 'Admin: Fetch All Customers Initiated',
  ADMIN_CUSTOMER_FETCH_ALL_FAILED: 'Admin: Fetch All Customers Failed',

  ADMIN_CUSTOMER_FETCH_BY_ID_INIT: 'Admin: Fetch Customer By ID Initiated',
  ADMIN_CUSTOMER_FETCH_BY_ID_FAILED: 'Admin: Fetch Customer By ID Failed',

  ADMIN_CUSTOMER_UPDATE_INIT: 'Admin: Update Customer Initiated',
  ADMIN_CUSTOMER_UPDATE_FAILED: 'Admin: Update Customer Failed',

  ADMIN_CUSTOMER_DELETE_INIT: 'Admin: Delete Customer Initiated',
  ADMIN_CUSTOMER_DELETE_FAILED: 'Admin: Delete Customer Failed',

  ADMIN_CUSTOMER_ADDRESS_FETCH_INIT: 'Admin: Fetch Customer Addresses Initiated',
  ADMIN_CUSTOMER_ADDRESS_FETCH_FAILED: 'Admin: Fetch Customer Addresses Failed',

  // Technician Specific
  TECHNICIAN_CREATE_SUCCESS: 'Technician Entity Created Successfully',
  AUTH_REGISTER_FAILED_EMAIL_EXISTS: 'Registration Failed - Email Already Exists',
  AUTH_REGISTER_FAILED_PHONE_EXISTS: 'Registration Failed - Phone Already Exists',
};