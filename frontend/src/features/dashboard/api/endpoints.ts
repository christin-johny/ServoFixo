export const CUSTOMER_DASHBOARD_ENDPOINTS = { 
  POPULAR_SERVICES: "/customer/services/popular", 
  BANNERS: "/customer/banners", 
};

export const ADMIN_DASHBOARD_ENDPOINTS = { 
  STATS: "/admin/dashboard/stats", 
};

export const TECHNICIAN_DASHBOARD_ENDPOINTS = {
  SUMMARY: "/technician/dashboard/summary", 
};
export const CUSTOMER_SERVICE_ENDPOINTS = {
  CATEGORIES: "/customer/categories",
  POPULAR_SERVICES: "/customer/services/popular",
  SERVICES: "/customer/services",
  SERVICE_BY_ID: (id: string) => `/customer/services/${id}`,
};