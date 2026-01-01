export const LogEvents = {
  //authentication
  AUTH_LOGIN_INIT: 'Login Initiated',
  AUTH_LOGIN_SUCCESS: 'Login Successful',
  AUTH_LOGIN_FAILED: 'Login Failed',
  
  AUTH_REGISTER_INIT: 'Registration Initiated',
  AUTH_REGISTER_SUCCESS: 'Registration Successful',
  AUTH_REGISTER_FAILED: 'Registration Failed',
  
  AUTH_LOGOUT_SUCCESS: 'Logout Successful',
  
  AUTH_REFRESH_INIT: 'Token Refresh Initiated',
  AUTH_REFRESH_SUCCESS: 'Token Refresh Successful',
  AUTH_REFRESH_FAILED: 'Token Refresh Failed',
  
  AUTH_UNAUTHORIZED: 'Unauthorized Access Attempt',
  AUTH_FORBIDDEN: 'Forbidden Access Attempt',
  // ZONE MODULE
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

  // ADDRESS MODULE
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

  // CATEGORY MODULE

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

  // SERVICE MODULE
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
  
  SERVICE_FETCH_MOST_BOOKED: 'Fetching Most Booked Services',
  SERVICE_FETCH_LISTING: 'Fetching Service Listing with Filters',
  SERVICE_GET_BY_ID: 'Fetching Service By ID'
};