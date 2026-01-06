import type { Request, Response } from "express";
import { IUseCase } from "../../../application/interfaces/IUseCase"; 
import {
  ErrorMessages,
  SuccessMessages,
} from "../../../../../shared/types/enums/ErrorMessages";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { refreshCookieOptions } from "../../../infrastructure/config/Cookie";
import redis from "../../../infrastructure/redis/redisClient";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  user?: unknown;
}

export class CustomerAuthController {
  constructor(
    private readonly _requestRegisterOtpUseCase: IUseCase<unknown, [{ email: string; phone: string }]>,
    private readonly _verifyRegisterOtpUseCase: IUseCase<AuthResult, [{ email: string; otp: string; sessionId: string; name: string; password: string; phone: string }]>,
    private readonly _customerLoginUseCase: IUseCase<AuthResult, [{ email: string; password: string }]>,
    private readonly _requestForgotPasswordOtpUseCase: IUseCase<unknown, [{ email: string }]>,
    private readonly _verifyForgotPasswordOtpUseCase: IUseCase<unknown, [{ email: string; otp: string; sessionId: string; newPassword: string }]>,
    private readonly _customerGoogleLoginUseCase: IUseCase<AuthResult, [{ token?: string; customer?: unknown }]>,
    private readonly _logger: ILogger
  ) {}

  registerInitOtp = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, phone } = req.body;
      this._logger.info(
        `${LogEvents.AUTH_REGISTER_INIT} - Requesting OTP for: ${email}`
      );

      if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }
      const result = await this._requestRegisterOtpUseCase.execute({
        email,
        phone,
      });

      this._logger.info(`${LogEvents.AUTH_OTP_SENT} - Registration`);
      return res.status(StatusCodes.OK).json(result);
    } catch (err: unknown) {
      const trace = err instanceof Error ? err.stack : String(err);
      this._logger.error(LogEvents.AUTH_OTP_INIT_FAILED, trace);

      if (err instanceof Error) {
        if (err.message === ErrorMessages.EMAIL_ALREADY_EXISTS) {
          return res.status(StatusCodes.CONFLICT).json({
            error: ErrorMessages.EMAIL_ALREADY_EXISTS,
          });
        }
        if (err.message === ErrorMessages.PHONE_ALREADY_EXISTS) {
          return res
            .status(StatusCodes.CONFLICT)
            .json({ error: ErrorMessages.PHONE_ALREADY_EXISTS });
        }
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
      this._logger.info(LogEvents.AUTH_OTP_VERIFY_INIT);
      const { email, otp, sessionId, name, password, phone } = req.body;

      if (!email || !otp || !sessionId || !name || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }
      const result = await this._verifyRegisterOtpUseCase.execute({
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

      this._logger.info(`${LogEvents.AUTH_REGISTER_SUCCESS} - Email: ${email}`);
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.REGISTRATION_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: unknown) {
      const trace = err instanceof Error ? err.stack : String(err);
      this._logger.error(LogEvents.AUTH_REGISTER_FAILED, trace);

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
      this._logger.info(`${LogEvents.AUTH_LOGIN_INIT} (Customer)`);
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this._customerLoginUseCase.execute({
        email,
        password,
      });

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      }

      this._logger.info(
        `${LogEvents.AUTH_LOGIN_SUCCESS} (Customer) - Email: ${email}`
      );
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.LOGIN_SUCCESS,
        accessToken: result.accessToken,
      });
    } catch (err: unknown) {
      const trace = err instanceof Error ? err.stack : String(err);
      this._logger.error(`${LogEvents.AUTH_LOGIN_FAILED} (Customer)`, trace);

      if (err instanceof Error) {
        if (err.message === ErrorMessages.INVALID_CREDENTIALS) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            error: ErrorMessages.INVALID_CREDENTIALS,
          });
        }
        if (err.message === ErrorMessages.ACCOUNT_BLOCKED) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            error: ErrorMessages.ACCOUNT_BLOCKED,
          });
        }
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
      this._logger.info(
        `${LogEvents.AUTH_FORGOT_PASSWORD_INIT} - Email: ${email}`
      );

      if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this._requestForgotPasswordOtpUseCase.execute({
        email,
      });

      this._logger.info(`${LogEvents.AUTH_OTP_SENT} - Forgot Password`);
      return res.status(StatusCodes.OK).json(result);
    } catch (err: unknown) {
      const trace = err instanceof Error ? err.stack : String(err);
      this._logger.error(LogEvents.AUTH_FORGOT_PASS_INIT_FAILED, trace);

      if (err instanceof Error) {
        if (err.message === ErrorMessages.CUSTOMER_NOT_FOUND) {
          return res.status(StatusCodes.NOT_FOUND).json({
            message: ErrorMessages.CUSTOMER_NOT_FOUND,
          });
        }

        if (err.message === "TOO_MANY_OTP_REQUESTS") {
          return res.status(429).json({
            message: "Too many OTP requests. Try again later.",
          });
        }
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
      this._logger.info(`${LogEvents.AUTH_OTP_VERIFY_INIT} - Forgot Password`);
      const { email, otp, sessionId, newPassword } = req.body;

      if (!email || !otp || !sessionId || !newPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this._verifyForgotPasswordOtpUseCase.execute({
        email,
        otp,
        sessionId,
        newPassword,
      });

      this._logger.info(
        `${LogEvents.AUTH_PASSWORD_RESET_SUCCESS} - Email: ${email}`
      );
      return res.status(StatusCodes.OK).json(result);
    } catch (err: unknown) {
      const trace = err instanceof Error ? err.stack : String(err);
      this._logger.error(LogEvents.AUTH_FORGOT_PASS_VERIFY_FAILED, trace);

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
      this._logger.info(LogEvents.AUTH_GOOGLE_LOGIN_INIT);
      const { token } = req.body;

      if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this._customerGoogleLoginUseCase.execute({ token });

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      }

      this._logger.info(LogEvents.AUTH_GOOGLE_LOGIN_SUCCESS);
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.GOOGLE_LOGIN_SUCCESS,
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err: unknown) {
      const trace = err instanceof Error ? err.stack : String(err);
      this._logger.error(LogEvents.AUTH_GOOGLE_LOGIN_FAILED, trace);
      
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  googleLoginCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      this._logger.info(`${LogEvents.AUTH_GOOGLE_LOGIN_INIT} (Callback)`);
      const user = req.user as unknown; 

      if (!user) {
        res.redirect(
          `${process.env.FRONTEND_ORIGIN}/login?error=AuthenticationFailed`
        );
        return;
      }

      const result = await this._customerGoogleLoginUseCase.execute({
        customer: user as any, 
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
      this._logger.info(`${LogEvents.AUTH_GOOGLE_LOGIN_SUCCESS} (Callback)`);
      res.redirect(`${process.env.FRONTEND_ORIGIN}`);
    } catch (err: unknown) {
      const trace = err instanceof Error ? err.stack : String(err);
      this._logger.error(LogEvents.AUTH_GOOGLE_CALLBACK_FAILED, trace);
      
      res.redirect(`${process.env.FRONTEND_ORIGIN}/login?error=InternalError`);
    }
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;

      if (refreshToken) {
        try {
          await redis.del(`refresh:${refreshToken}`);
        } catch (err: unknown) {
          const trace = err instanceof Error ? err.stack : String(err);
          this._logger.error(
            "Failed to delete refresh token from redis (logout)",
            trace
          );
        }
      }
      res.clearCookie("refreshToken", refreshCookieOptions);

      this._logger.info(LogEvents.AUTH_LOGOUT_SUCCESS);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.LOGOUT_SUCCESS });
    } catch (err: unknown) {
      const trace = err instanceof Error ? err.stack : String(err);
      this._logger.error(LogEvents.AUTH_LOGOUT_FAILED, trace);

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ErrorMessages.INTERNAL_ERROR });
    }
  };
}