import api from "../../../lib/axiosClient";
import { TECHNICIAN_PROFILE_ENDPOINTS } from "./endpoints";
import type { WalletDetailsDto, TransactionDto } from "../types/TechnicianTypes";

/**
 * Fetches real-time wallet balances and payout eligibility insights
 */
export const getWalletDetails = async (): Promise<WalletDetailsDto> => {
  const { data } = await api.get(TECHNICIAN_PROFILE_ENDPOINTS.WALLET_DETAILS);
  return data.data;
};

/**
 * Fetches paginated transaction history
 */
export const getWalletTransactions = async (page = 1): Promise<{ transactions: TransactionDto[], total: number }> => {
  const { data } = await api.get(`${TECHNICIAN_PROFILE_ENDPOINTS.WALLET_TRANSACTIONS}?page=${page}`);
  return data.data;
};