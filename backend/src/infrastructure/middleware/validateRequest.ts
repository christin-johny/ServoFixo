import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { StatusCodes } from "../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../shared/types/enums/ErrorMessages";

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (
        req.originalUrl.includes("/categories") &&
        req.method === "POST" &&
        !req.file
      ) {
        throw new Error("Category image is required.");
      }

      if (req.originalUrl.includes("/services") && req.method === "POST") {
        const files = req.files as any;
        if (!files || files.length === 0) {
          throw new Error("At least one service image is required.");
        }
      }

      next();
    } catch (error: unknown) {
  if (error instanceof ZodError) {
    const errorMessage = error.errors
      .map(e => e.message)
      .join(". ");

    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: errorMessage });
  }

  const message =
    error instanceof Error ? error.message : ErrorMessages.INTERNAL_ERROR;

  return res
    .status(StatusCodes.BAD_REQUEST)
    .json({ error: message });
}

  };
};
