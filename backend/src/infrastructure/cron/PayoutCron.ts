import cron from "node-cron";
import { ProcessWeeklyPayoutBatchUseCase } from "../../application/use-cases/wallet/ProcessWeeklyPayoutBatchUseCase";

// Every Sunday at 23:59 (11:59 PM)
export const setupPayoutCron = (useCase: ProcessWeeklyPayoutBatchUseCase) => {
  cron.schedule("59 23 * * 0", async () => {
    console.log("[CRON] Starting Weekly Payout Batching...");
    try {
     await useCase.execute(); 
    } catch (error) {
      console.error("[CRON] Payout Batching Failed:", error);
    }
  });
};