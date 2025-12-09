import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate Body, Query, and Params
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Special Check: Files
      if (req.originalUrl.includes('/categories') && req.method === 'POST' && !req.file) {
         throw new Error("Category image is required.");
      }
      
      if (req.originalUrl.includes('/services') && req.method === 'POST') {
         // Cast to any to safely check length without complex Multer types
         const files = req.files as any;
         if (!files || files.length === 0) {
            throw new Error("At least one service image is required.");
         }
      }

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        // ✅ FIX: Explicitly type 'e' as any to avoid TS7006 and TS2339
        const errorMessage = error.errors.map((e: any) => e.message).join('. ');
        return res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
      }
      return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  };
};