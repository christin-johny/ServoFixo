
export const ADMIN_SERVICE_ENDPOINTS = {
  SERVICES: "/admin/services",
  SERVICE_BY_ID: (id: string) => `/admin/services/${id}`,
  TOGGLE_STATUS: (id: string) =>
    `/admin/services/${id}/toggle`,
};

export const ADMIN_CUSTOMER_ENDPOINTS = {
  CUSTOMERS: "/admin/customers",
  CUSTOMER_BY_ID: (id: string) => `/admin/customers/${id}`,
  CUSTOMER_ADDRESSES: (id: string) =>
    `/admin/customers/${id}/addresses`,
};

export const ADMIN_CATEGORY_ENDPOINTS = {
  CATEGORIES: "/admin/categories",
  CATEGORY_BY_ID: (id: string) => `/admin/categories/${id}`,
  TOGGLE_STATUS: (id: string) =>
    `/admin/categories/${id}/toggle`,
};
export const ADMIN_AUTH_ENDPOINTS = {
  LOGIN: "/admin/auth/login",
  LOGOUT: "/admin/auth/logout",
};

export const ADMIN_ZONE_ENDPOINTS = {
  ZONES: "/admin/zones",
  ZONE_BY_ID: (id: string) => `/admin/zones/${id}`,
};

export const ADMIN_TECHNICIAN_ENDPOINTS = {
  QUEUE: "/admin/technicians/queue",
  
  PROFILE: (id: string) => `/admin/technicians/${id}`,
  VERIFY: (id: string) => `/admin/technicians/${id}/verify`,
  
  LIST: "/admin/technicians" 
};