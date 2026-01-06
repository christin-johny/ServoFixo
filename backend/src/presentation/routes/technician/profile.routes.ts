import { Router } from "express";
import { technicianProfileController } from "../../../infrastructure/di/Container"; 
import { uploadAvatarMiddleware, uploadDocumentMiddleware } from "../../../infrastructure/middleware/technicianUploadMiddleware";

const router = Router();

// READ 
router.get(
  "/onboarding/status", 
  technicianProfileController.getOnboardingStatus.bind(technicianProfileController)
);

//  WRITE (Step-by-Step)  
router.patch("/onboarding/step-1", technicianProfileController.updatePersonalDetails.bind(technicianProfileController));

router.patch(
  "/onboarding/step-2", 
  technicianProfileController.updateWorkPreferences.bind(technicianProfileController)
);

router.patch(
  "/onboarding/step-3", 
  technicianProfileController.updateZones.bind(technicianProfileController)
);

router.patch(
  "/onboarding/step-4", 
  technicianProfileController.updateRateAgreement.bind(technicianProfileController)
);

router.patch(
  "/onboarding/step-5", 
  technicianProfileController.updateDocuments.bind(technicianProfileController)
);

router.patch(
  "/onboarding/step-6", 
  technicianProfileController.updateBankDetails.bind(technicianProfileController)
);

router.post(
  "/onboarding/upload/avatar", 
  uploadAvatarMiddleware.single("file"),  
  technicianProfileController.uploadAvatar.bind(technicianProfileController)
);
router.post(
  "/onboarding/upload/document", 
  uploadDocumentMiddleware.single("file"), 
  technicianProfileController.uploadDocument.bind(technicianProfileController)
);
router.patch(
  "/status", 
  technicianProfileController.toggleOnlineStatus.bind(technicianProfileController)
);
router.post(
  "/onboarding/resubmit", 
  technicianProfileController.resubmitProfile.bind(technicianProfileController)
);

export default router;