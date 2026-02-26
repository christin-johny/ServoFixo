import api from "../../../lib/axiosClient";
import { ADMIN_DASHBOARD_ENDPOINTS, TECHNICIAN_DASHBOARD_ENDPOINTS } from "./endpoints";

export const getAdminDashboardStats = async () => {
  const response = await api.get(ADMIN_DASHBOARD_ENDPOINTS.STATS);
  return response.data.data;
};

export const getTechnicianDashboardSummary = async () => {
  const response = await api.get(TECHNICIAN_DASHBOARD_ENDPOINTS.SUMMARY);
  return response.data.data;
};