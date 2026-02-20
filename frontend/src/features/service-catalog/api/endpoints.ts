export const ADMIN_SERVICE_ENDPOINTS = {
  SERVICES: "/admin/services",
  SERVICE_BY_ID: (id: string) => `/admin/services/${id}`,
  TOGGLE_STATUS: (id: string) => `/admin/services/${id}/toggle`,
};

export const ADMIN_CATEGORY_ENDPOINTS = {
  CATEGORIES: "/admin/categories",
  CATEGORY_BY_ID: (id: string) => `/admin/categories/${id}`,
  TOGGLE_STATUS: (id: string) => `/admin/categories/${id}/toggle`,
};

export const CUSTOMER_SERVICE_ENDPOINTS = {
  CATEGORIES: "/customer/categories",
  POPULAR_SERVICES: "/customer/services/popular",
  SERVICES: "/customer/services",
  SERVICE_BY_ID: (id: string) => `/customer/services/${id}`,
};

export const TECHNICIAN_CATALOG_ENDPOINTS = {
  GET_CATEGORIES: "/technician/data/categories",
  GET_SERVICES: "/technician/data/services",
};