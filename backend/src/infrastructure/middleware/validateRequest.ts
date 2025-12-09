import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';

export const validateRequest = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate Body, Query, and Params
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Special Check: Files (Zod has trouble with Multer's req.file structure directly in schema)
      // We manually check if files exist for routes that require them
      if (req.originalUrl.includes('/categories') && req.method === 'POST' && !req.file) {
         throw new Error("Category image is required.");
      }
      
      if (req.originalUrl.includes('/services') && req.method === 'POST') {
         const files = req.files as Express.Multer.File[];
         if (!files || files.length === 0) {
            throw new Error("At least one service image is required.");
         }
      }

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        // Format Zod errors into a readable string
        const errorMessage = error.errors.map((e) => e.message).join('. ');
        return res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
      }
      return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  };
};