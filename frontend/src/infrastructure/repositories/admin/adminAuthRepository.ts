import api from "../../api/axiosClient";
import { ADMIN_AUTH_ENDPOINTS } from "../../api/endpoints/Admin/admin.endpoints";

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export const adminLogin = async (payload: AdminLoginPayload) => {
  const resp = await api.post(ADMIN_AUTH_ENDPOINTS.LOGIN, payload);
  return resp.data;
};

export const adminLogout = async () => {
  const resp = await api.post(ADMIN_AUTH_ENDPOINTS.LOGOUT);
  return resp.data;
};
