 
const VERSION = "/v1";

export const NOTIFICATION_ENDPOINTS = { 
  GET_ALL: `${VERSION}/technician/notifications`,
  MARK_READ: (id: string) => `${VERSION}/technician/notifications/${id}/read`,
  MARK_ALL_READ: `${VERSION}/technician/notifications/read-all`,
};