const VERSION = "/v1";

export const ADMIN_ZONE_ENDPOINTS = {
  ZONES: `${VERSION}/admin/zones`,
  ZONE_BY_ID: (id: string) => `${VERSION}/admin/zones/${id}`,
};

export const CUSTOMER_ZONE_ENDPOINTS = {
  ZONE_BY_LOCATION: `${VERSION}/customer/zones/find-by-location`,
};

export const TECHNICIAN_ZONE_ENDPOINTS = {
  GET_ZONES: `${VERSION}/technician/data/zones`,
};