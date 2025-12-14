import api from "../../api/axiosClient";

export const adminLogin = async (payload: { email: string; password: string }) => {
  const resp = await api.post("/admin/auth/login", payload);
  return resp.data;
};

export const adminRefresh = async () => {
  const resp = await api.post("admin/auth/refresh");
  return resp.data;
};

export const adminLogout = async () => {
  const resp = await api.post("/admin/auth/logout");
  return resp.data;
};
