const VERSION = "/v1";

export const ADMIN_PAYOUT_ENDPOINTS = {
  LIST: `${VERSION}/admin/payouts`, 
   
  PROCESS: (id: string) => `${VERSION}/admin/payouts/${id}/status`, 
  
  FAIL: (id: string) => `${VERSION}/admin/payouts/${id}/fail`,

  TRIGGER_BATCH: `${VERSION}/admin/payouts/trigger-batch`,
};