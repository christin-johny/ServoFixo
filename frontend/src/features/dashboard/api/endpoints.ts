const VERSION = "/v1";

export const CUSTOMER_DASHBOARD_ENDPOINTS = { 
  POPULAR_SERVICES: `${VERSION}/customer/services/popular`, 
  BANNERS: `${VERSION}/customer/banners`, 
};

export const ADMIN_DASHBOARD_ENDPOINTS = { 
  STATS: `${VERSION}/admin/dashboard/stats`, 
};

export const TECHNICIAN_DASHBOARD_ENDPOINTS = {
  SUMMARY: `${VERSION}/technician/dashboard/stats`, 
};

export const CUSTOMER_SERVICE_ENDPOINTS = {
  CATEGORIES: `${VERSION}/customer/categories`,
  POPULAR_SERVICES: `${VERSION}/customer/services/popular`,
  SERVICES: `${VERSION}/customer/services`,
  SERVICE_BY_ID: (id: string) => `${VERSION}/customer/services/${id}`,
};