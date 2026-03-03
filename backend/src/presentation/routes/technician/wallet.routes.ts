import { Router } from "express";
import { walletController } from "../../../infrastructure/di/Container"; 

const router = Router();

router.get(  "/balance",  walletController.getBalance.bind(walletController));

router.get(  "/transactions", walletController.getTransactions.bind(walletController));

export default router;