import api from "../../api/axiosClient";
import { TECH_BOOKING_ENDPOINTS } from "../../api/endpoints/Technician/technician.endpoints";

export interface JobResponsePayload {
  response: "ACCEPT" | "REJECT";
}
export interface JobHistoryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string | string[];
}


export const respondToBooking = async (
  bookingId: string,
  response: "ACCEPT" | "REJECT"
): Promise<void> => {
  await api.post(TECH_BOOKING_ENDPOINTS.TECH_BOOKING_URL(bookingId), { response });
};

export const getTechnicianBookingById = async (bookingId: string) => { 
  const response = await api.get(TECH_BOOKING_ENDPOINTS.GET_BY_ID(bookingId));
  return response.data.data;
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
 
  const response = await api.patch(TECH_BOOKING_ENDPOINTS.UPDATE_STATUS(bookingId), { status });
  return response.data.data;
};

export const verifyBookingOtp = async (bookingId: string, otp: string) => { 
  const response = await api.post(TECH_BOOKING_ENDPOINTS.START_JOB(bookingId), { otp });
  return response.data.data;
};

export const cancelBookingByTechnician = async (bookingId: string, reason: string) => { 
  const response = await api.post(TECH_BOOKING_ENDPOINTS.CANCEL_JOB(bookingId), { reason });
  return response.data;
};

export const addExtraCharge = async (bookingId: string, data: { title: string; amount: number; proofFile?: File }) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("amount", data.amount.toString());
  if (data.proofFile) formData.append("proof", data.proofFile);

  const response = await api.post(TECH_BOOKING_ENDPOINTS.ADD_EXTRA_CHARGE(bookingId), formData);
  return response.data;
};

export const completeJob = async (bookingId: string) => {
  const response = await api.post(TECH_BOOKING_ENDPOINTS.COMPLETE_JOB(bookingId));
  return response.data;
};

export const getTechnicianJobs = async (params: JobHistoryParams = {}) => {
  const response = await api.get(TECH_BOOKING_ENDPOINTS.GET_HISTORY, { params }); 
  return response.data.data; 
};