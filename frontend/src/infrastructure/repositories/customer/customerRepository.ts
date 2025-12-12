import api from "../../api/axiosClient";

import { type CustomerProfile } from "../../../store/customerSlice";


export const getProfile = async (): Promise<CustomerProfile> => {
  const response = await api.get("/api/customer/profile");
  return response.data.data || response.data;
};

export const updateProfile = async (data: Partial<CustomerProfile>): Promise<CustomerProfile> => {
  const response = await api.put("/api/customer/profile", data);
  return response.data.data || response.data;
};


export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post("/api/customer/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data || response.data;
};