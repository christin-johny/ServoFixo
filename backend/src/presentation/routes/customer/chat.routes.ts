import { Router } from "express";
import { chatController} from "../../../infrastructure/di/Container";
 

const router = Router();

router.post("/start", chatController.startSession);
router.post("/:sessionId/message", chatController.sendMessage);
router.get("/history", chatController.getHistory);
router.post("/:sessionId/resolve", chatController.resolveChat);

export default router;