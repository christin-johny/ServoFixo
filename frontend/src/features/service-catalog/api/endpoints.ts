// Central versioning prefix to match backend app.use('/api/v1', v1Router)
const VERSION = "/v1";

export const ADMIN_SERVICE_ENDPOINTS = {
  SERVICES: `${VERSION}/admin/services`,
  SERVICE_BY_ID: (id: string) => `${VERSION}/admin/services/${id}`,
  TOGGLE_STATUS: (id: string) => `${VERSION}/admin/services/${id}/toggle`,
};

export const ADMIN_CATEGORY_ENDPOINTS = {
  CATEGORIES: `${VERSION}/admin/categories`,
  CATEGORY_BY_ID: (id: string) => `${VERSION}/admin/categories/${id}`,
  TOGGLE_STATUS: (id: string) => `${VERSION}/admin/categories/${id}/toggle`,
};

export const CUSTOMER_SERVICE_ENDPOINTS = {
  CATEGORIES: `${VERSION}/customer/categories`,
  POPULAR_SERVICES: `${VERSION}/customer/services/popular`,
  SERVICES: `${VERSION}/customer/services`,
  SERVICE_BY_ID: (id: string) => `${VERSION}/customer/services/${id}`,
};

export const TECHNICIAN_CATALOG_ENDPOINTS = {
  GET_CATEGORIES: `${VERSION}/technician/data/categories`,
  GET_SERVICES: `${VERSION}/technician/data/services`,
};