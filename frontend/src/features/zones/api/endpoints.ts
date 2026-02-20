export const ADMIN_ZONE_ENDPOINTS = {
  ZONES: "/admin/zones",
  ZONE_BY_ID: (id: string) => `/admin/zones/${id}`,
};

export const CUSTOMER_ZONE_ENDPOINTS = {
  ZONE_BY_LOCATION: "/customer/zones/find-by-location",
};

export const TECHNICIAN_ZONE_ENDPOINTS = {
  GET_ZONES: "/technician/data/zones",
};