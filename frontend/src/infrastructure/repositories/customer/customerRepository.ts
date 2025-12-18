import api from "../../api/axiosClient";
import { type CustomerProfile, type Address } from "../../../store/customerSlice";


export const getProfile = async (): Promise<CustomerProfile> => {
  const response = await api.get("/customer/profile");
  return response.data.data.user; 
};

export const updateProfile = async (data: Partial<CustomerProfile>): Promise<CustomerProfile> => {
  const response = await api.put("/customer/profile", data);
  return response.data.data;
};

export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post("/customer/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};


export const getZoneByLocation = async (lat: number, lng: number): Promise<string> => {
  const response = await api.get(`/customer/zones/find-by-location`, {
    params: { lat, lng }
  });
  return response.data.data?.name || "Outside Service Area";
};


export const getMyAddresses = async (): Promise<Address[]> => {
  const response = await api.get("/customer/addresses");
  return response.data.data;
};


export const addAddress = async (addressData: Omit<Address, 'id'> & { lat: number, lng: number }): Promise<Address> => {
  const response = await api.post("/customer/addresses", addressData);
  return response.data.data;
};


export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/customer/addresses/${id}`);
};


export const setDefaultAddress = async (id: string): Promise<void> => {
  await api.patch(`/customer/addresses/${id}/default`);
};