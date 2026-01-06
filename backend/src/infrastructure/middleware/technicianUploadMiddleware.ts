import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { ErrorMessages } from "../../../../shared/types/enums/ErrorMessages";

const storage = multer.memoryStorage();
 
const avatarFileFilter = (
  req: Request, 
  file: Express.Multer.File, 
  cb: FileFilterCallback
): void => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else { 
    cb(new Error(ErrorMessages.TECH_INVALID_FILE_TYPE)); 
  }
};

const docFileFilter = (
  req: Request, 
  file: Express.Multer.File, 
  cb: FileFilterCallback
): void => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(ErrorMessages.TECH_INVALID_FILE_TYPE));
  }
};

export const uploadAvatarMiddleware = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: avatarFileFilter,
});

export const uploadDocumentMiddleware = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: docFileFilter,
});