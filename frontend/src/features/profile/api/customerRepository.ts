import api from "../../../lib/axiosClient";
import {
  type CustomerProfile,
  type Address,
} from "../../../store/customerSlice";
import { CUSTOMER_PROFILE_ENDPOINTS  } from "./endpoints";

export const getProfile = async (): Promise<CustomerProfile> => {
  const response = await api.get(CUSTOMER_PROFILE_ENDPOINTS .PROFILE);
  return response.data.data.user;
};

export const updateProfile = async (
  data: Partial<CustomerProfile>
): Promise<CustomerProfile> => {
  const response = await api.put(CUSTOMER_PROFILE_ENDPOINTS .PROFILE, data);
  return response.data.data;
};

export const uploadAvatar = async (
  file: File
): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post(CUSTOMER_PROFILE_ENDPOINTS .AVATAR, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

export const changePassword = async (data: unknown): Promise<unknown> => {
  const response = await api.patch(CUSTOMER_PROFILE_ENDPOINTS .CHANGE_PASSWORD, data);
  return response.data;
};

export const getZoneByLocation = async (
  lat: number,
  lng: number
): Promise<string> => {
  const response = await api.get(CUSTOMER_PROFILE_ENDPOINTS .ZONE_BY_LOCATION, {
    params: { lat, lng },
  });
  return response.data.data?.zoneName || "Outside Service Area";
};

export const getMyAddresses = async (): Promise<Address[]> => {
  const response = await api.get(CUSTOMER_PROFILE_ENDPOINTS .ADDRESSES);
  return response.data.data;
};

export const addAddress = async (addressData: unknown): Promise<Address> => {
  const response = await api.post(CUSTOMER_PROFILE_ENDPOINTS .ADDRESSES, addressData);
  return response.data.data;
};

export const updateAddress = async (
  id: string,
  addressData: unknown
): Promise<Address> => {
  const response = await api.put(CUSTOMER_PROFILE_ENDPOINTS .ADDRESS_BY_ID(id), addressData);
  return response.data.data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(CUSTOMER_PROFILE_ENDPOINTS .ADDRESS_BY_ID(id));
};

export const setDefaultAddress = async (id: string): Promise<void> => {
  await api.patch(CUSTOMER_PROFILE_ENDPOINTS .SET_DEFAULT_ADDRESS(id));
};
