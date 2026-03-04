import api from "../../../lib/axiosClient";
import { ADMIN_PAYOUT_ENDPOINTS } from "./endpoints";
import type { AdminPayoutDto, PayoutProcessPayload } from "../types/AdminPayoutTypes";

export const getPayouts = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => {
  const { data } = await api.get(ADMIN_PAYOUT_ENDPOINTS.LIST, { params });
   
  const payload = data?.data; 
 
  if (Array.isArray(payload)) {
    return {
      data: payload as AdminPayoutDto[],
      total: payload.length,
      totalPages: 1
    };
  }
   
  return {
    data: (payload?.data || []) as AdminPayoutDto[],
    total: payload?.total || 0,
    totalPages: payload?.limit ? Math.ceil((payload?.total || 0) / payload.limit) : 1
  };
};

export const processPayout = async (id: string, payload: PayoutProcessPayload) => { 
  const { data } = await api.patch(ADMIN_PAYOUT_ENDPOINTS.PROCESS(id), payload);
  return data;
};

export const triggerWeeklyBatch = async () => {
  const { data } = await api.post(ADMIN_PAYOUT_ENDPOINTS.TRIGGER_BATCH);
  return data;
};