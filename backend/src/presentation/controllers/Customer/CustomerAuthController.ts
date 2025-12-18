import type { Request, Response } from "express";
import { RequestCustomerRegistrationOtpUseCase } from "../../../application/use-cases/auth/RequestCustomerRegistrationOtpUseCase";
import { VerifyCustomerRegistrationOtpUseCase } from "../../../application/use-cases/auth/VerifyCustomerRegistrationOtpUseCase";
import { CustomerLoginUseCase } from "../../../application/use-cases/auth/CustomerLoginUseCase";
import { RequestCustomerForgotPasswordOtpUseCase } from "../../../application/use-cases/auth/RequestCustomerForgotPasswordOtpUseCase";
import { VerifyCustomerForgotPasswordOtpUseCase } from "../../../application/use-cases/auth/VerifyCustomerForgotPasswordOtpUseCase";
import { CustomerGoogleLoginUseCase } from "../../../application/use-cases/auth/CustomerGoogleLoginUseCase";
import { ErrorCodes, ErrorMessages, SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { refreshCookieOptions } from "../../../infrastructure/config/Cookie";

import redis from "../../../infrastructure/redis/redisClient";

export class CustomerAuthController {
  constructor(
    private readonly requestRegisterOtpUseCase: RequestCustomerRegistrationOtpUseCase,
    private readonly verifyRegisterOtpUseCase: VerifyCustomerRegistrationOtpUseCase,
    private readonly customerLoginUseCase: CustomerLoginUseCase,
    private readonly requestForgotPasswordOtpUseCase: RequestCustomerForgotPasswordOtpUseCase,
    private readonly verifyForgotPasswordOtpUseCase: VerifyCustomerForgotPasswordOtpUseCase,
    private readonly customerGoogleLoginUseCase: CustomerGoogleLoginUseCase
  ) {}

  registerInitOtp = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email,phone } = req.body;
      if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }
      const result = await this.requestRegisterOtpUseCase.execute({ email,phone });

      return res.status(StatusCodes.OK).json(result);
    } catch (err: any) {
      if (
        err instanceof Error &&
        err.message === ErrorMessages.EMAIL_ALREADY_EXISTS
      ) {
        return res.status(StatusCodes.CONFLICT).json({
          error: ErrorMessages.EMAIL_ALREADY_EXISTS,
        });
      }
      if (err.message === ErrorMessages.PHONE_ALREADY_EXISTS) {
             return res.status(StatusCodes.CONFLICT).json({ error: ErrorMessages.PHONE_ALREADY_EXISTS });
        }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  registerVerifyOtp = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { email, otp, sessionId, name, password, phone } = req.body;
  
      if (!email || !otp || !sessionId || !name || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }
      const result = await this.verifyRegisterOtpUseCase.execute({
        email,
        otp,
        sessionId,
        name,
        password,
        phone,
      });

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      }
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.REGISTRATION_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: any) {
      if (err instanceof Error) {
        if (err.message === ErrorMessages.OTP_INVALID) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            error: ErrorMessages.OTP_INVALID,
          });
        }

        if (err.message === ErrorMessages.OTP_SESSION_INVALID) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            error: ErrorMessages.OTP_SESSION_INVALID,
          });
        }

        if (err.message === ErrorMessages.EMAIL_ALREADY_EXISTS) {
          return res.status(StatusCodes.CONFLICT).json({
            error: ErrorMessages.EMAIL_ALREADY_EXISTS,
          });
        }
        if (err.message === ErrorMessages.PHONE_ALREADY_EXISTS) {
          return res.status(StatusCodes.CONFLICT).json({
            error: ErrorMessages.PHONE_ALREADY_EXISTS,
          });
        }
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.customerLoginUseCase.execute({
        email,
        password,
      });

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      }

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.LOGIN_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: any) {
      if (
        err instanceof Error &&
        err.message === ErrorMessages.INVALID_CREDENTIALS
      ) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: ErrorMessages.INVALID_CREDENTIALS,
        });
      }
      if(err instanceof Error &&
        err.message === ErrorMessages.ACCOUNT_BLOCKED){
         return res.status(StatusCodes.UNAUTHORIZED).json({
          error: ErrorMessages.ACCOUNT_BLOCKED,
        }); 
        }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  forgotPasswordInitOtp = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.requestForgotPasswordOtpUseCase.execute({
        email,
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (err: any) {
      if (
        err instanceof Error &&
        err.message === ErrorMessages.CUSTOMER_NOT_FOUND
      ) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: ErrorMessages.CUSTOMER_NOT_FOUND,
        });
      }

      if (err instanceof Error && err.message === "TOO_MANY_OTP_REQUESTS") {
        return res.status(429).json({
          message: "Too many OTP requests. Try again later.",
        });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  forgotPasswordVerifyOtp = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { email, otp, sessionId, newPassword } = req.body;

      if (!email || !otp || !sessionId || !newPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.verifyForgotPasswordOtpUseCase.execute({
        email,
        otp,
        sessionId,
        newPassword,
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (err: any) {
      if (err instanceof Error) {
        if (err.message === ErrorMessages.OTP_INVALID) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message: ErrorMessages.OTP_INVALID,
          });
        }

        if (err.message === ErrorMessages.OTP_SESSION_INVALID) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message: ErrorMessages.OTP_SESSION_INVALID,
          });
        }

        if (err.message === ErrorMessages.CUSTOMER_NOT_FOUND) {
          return res.status(StatusCodes.NOT_FOUND).json({
            message: ErrorMessages.CUSTOMER_NOT_FOUND,
          });
        }
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  googleLogin = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.customerGoogleLoginUseCase.execute({ token });

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      }

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.GOOGLE_LOGIN_SUCCESS,
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  googleLoginCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as any;
      if (!user) {
        res.redirect(
          `${process.env.FRONTEND_ORIGIN}/login?error=AuthenticationFailed`
        );
        return;
      }
      const result = await this.customerGoogleLoginUseCase.execute({
        customer: user,
      });

      if (!result || !result.accessToken || !result.refreshToken) {
        res.redirect(
          `${process.env.FRONTEND_ORIGIN}/login?error=AuthenticationFailed`
        );
        return;
      }

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      }
      res.redirect(`${process.env.FRONTEND_ORIGIN}`);
    } catch (err: any) {
      res.redirect(`${process.env.FRONTEND_ORIGIN}/login?error=InternalError`);
    }
  };
  logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;

      if (refreshToken) {
        try {
          await redis.del(`refresh:${refreshToken}`);
        } catch (err) {
          console.error(
            "Failed to delete refresh token from redis (logout):",
            err
          );
        }
      }
      res.clearCookie("refreshToken", refreshCookieOptions);

      return res.status(StatusCodes.OK).json({ message: SuccessMessages.LOGOUT_SUCCESS });
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ErrorMessages.INTERNAL_ERROR });
    }
  };
}
