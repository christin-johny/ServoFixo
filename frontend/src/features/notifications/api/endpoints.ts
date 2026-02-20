export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: "/technician/notifications",
  MARK_READ: (id: string) => `/technician/notifications/${id}/read`,
  MARK_ALL_READ: "/technician/notifications/read-all",
};