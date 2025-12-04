// server/controllers/CustomerAuthController.ts
import type { Request, Response } from 'express';
import { RequestCustomerRegistrationOtpUseCase } from '../../application/use-cases/auth/RequestCustomerRegistrationOtpUseCase';
import { VerifyCustomerRegistrationOtpUseCase } from '../../application/use-cases/auth/VerifyCustomerRegistrationOtpUseCase';
import { CustomerLoginUseCase } from '../../application/use-cases/auth/CustomerLoginUseCase';
import { RequestCustomerForgotPasswordOtpUseCase } from '../../application/use-cases/auth/RequestCustomerForgotPasswordOtpUseCase';
import { VerifyCustomerForgotPasswordOtpUseCase } from '../../application/use-cases/auth/VerifyCustomerForgotPasswordOtpUseCase';
import { CustomerGoogleLoginUseCase } from '../../application/use-cases/auth/CustomerGoogleLoginUseCase';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';
import { refreshCookieOptions } from '../../infrastructure/config/Cookie';

// NEW imports
import redis from '../../infrastructure/redis/redisClient';
import { JwtService } from '../../infrastructure/security/JwtService';

export class CustomerAuthController {
  constructor(
    private readonly requestRegisterOtpUseCase: RequestCustomerRegistrationOtpUseCase,
    private readonly verifyRegisterOtpUseCase: VerifyCustomerRegistrationOtpUseCase,
    private readonly customerLoginUseCase: CustomerLoginUseCase,
    private readonly requestForgotPasswordOtpUseCase: RequestCustomerForgotPasswordOtpUseCase,
    private readonly verifyForgotPasswordOtpUseCase: VerifyCustomerForgotPasswordOtpUseCase,
    private readonly customerGoogleLoginUseCase: CustomerGoogleLoginUseCase
  ) {}

  // 1️⃣ Registration - init OTP
  registerInitOtp = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.requestRegisterOtpUseCase.execute({ email });
      return res.status(StatusCodes.OK).json(result);
    } catch (err: any) {
      if (err instanceof Error && err.message === ErrorMessages.EMAIL_ALREADY_EXISTS) {
        return res.status(StatusCodes.CONFLICT).json({
          error: ErrorMessages.EMAIL_ALREADY_EXISTS,
        });
      }

      console.error('Customer register init OTP error:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  // 2️⃣ Registration - verify OTP + create user
  registerVerifyOtp = async (req: Request, res: Response): Promise<Response> => {
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
          
      // If refresh token was returned by use-case, store in Redis and set cookie
      if (result.refreshToken) {
        try {
          // verify refresh token to get subject (user id)
          const jwtService = new JwtService();
          const payload = await jwtService.verifyRefreshToken(result.refreshToken);
          const ttlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60), 10);
          await redis.set(`refresh:${result.refreshToken}`, String(payload.sub), "EX", ttlSeconds);
        } catch (err) {
          console.error("Failed to store refresh token in redis (registerVerifyOtp):", err);
        }

        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
      }

      return res.status(StatusCodes.OK).json({
        message: 'Registration successful',
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
      }

      console.error('Customer register verify OTP error:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };
 
  // 3️⃣ Login (email + password)
  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.customerLoginUseCase.execute({ email, password });

      // If refresh token present, store it in Redis and set cookie
      if (result.refreshToken) {
        try {
          const jwtService = new JwtService();
          const payload = await jwtService.verifyRefreshToken(result.refreshToken);
          const ttlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60), 10);
          await redis.set(`refresh:${result.refreshToken}`, String(payload.sub), "EX", ttlSeconds);
        } catch (err) {
          console.error("Failed to store refresh token in redis (login):", err);
        }

        // set refresh cookie (httpOnly)
        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
      }

      return res.status(StatusCodes.OK).json({
        message: 'Login successful',
        accessToken: result.accessToken,
      });
    } catch (err: any) {
      if (err instanceof Error && err.message === ErrorMessages.INVALID_CREDENTIALS) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: ErrorMessages.INVALID_CREDENTIALS,
        });
      }

      console.error('Customer login error:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  // 4️⃣ Forgot password - init OTP
  forgotPasswordInitOtp = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.requestForgotPasswordOtpUseCase.execute({ email });

      return res.status(StatusCodes.OK).json(result);
    } catch (err: any) {
      if (err instanceof Error && err.message === ErrorMessages.CUSTOMER_NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: ErrorMessages.CUSTOMER_NOT_FOUND,
        });
      }

      console.error('Customer forgot password init OTP error:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  // 5️⃣ Forgot password - verify OTP + reset password
  forgotPasswordVerifyOtp = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, otp, sessionId, newPassword } = req.body;

      if (!email || !otp || !sessionId || !newPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
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
            error: ErrorMessages.OTP_INVALID,
          });
        }

        if (err.message === ErrorMessages.OTP_SESSION_INVALID) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            error: ErrorMessages.OTP_SESSION_INVALID,
          });
        }

        if (err.message === ErrorMessages.CUSTOMER_NOT_FOUND) {
          return res.status(StatusCodes.NOT_FOUND).json({
            error: ErrorMessages.CUSTOMER_NOT_FOUND,
          });
        }
      }

      console.error('Customer forgot password verify OTP error:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  // 6️⃣ Google Login
  googleLogin = async (req: Request, res: Response): Promise<Response> => {
    // Deprecated or used for manual token exchange if needed
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.customerGoogleLoginUseCase.execute({ token });

      // If refresh token present, store and set cookie
      if (result.refreshToken) {
        try {
          const jwtService = new JwtService();
          const payload = await jwtService.verifyRefreshToken(result.refreshToken);
          const ttlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60), 10);
          await redis.set(`refresh:${result.refreshToken}`, String(payload.sub), "EX", ttlSeconds);
        } catch (err) {
          console.error("Failed to store refresh token in redis (googleLogin):", err);
        }

        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
      }

      return res.status(StatusCodes.OK).json({
        message: 'Google login successful',
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err: any) {
      console.error('Customer google login error:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  // 7️⃣ Google Login Callback (Passport)
  googleLoginCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as any; 
      if (!user) {
         res.redirect(`${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/login?error=AuthenticationFailed`);
         return;
      }

      //const result = await this.customerGoogleLoginUseCase.generateTokens(user);
      const result = await this.customerLoginUseCase.execute(user);
      if (result.refreshToken) {
        try {
          const jwtService = new JwtService();
          const payload = await jwtService.verifyRefreshToken(result.refreshToken);
          const ttlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60), 10);
          await redis.set(`refresh:${result.refreshToken}`, String(payload.sub), "EX", ttlSeconds);
        } catch (err) {
          console.error("Failed to store refresh token in redis (googleLoginCallback):", err);
        }

        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
      }

      res.redirect(`${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/dashboard`);
    } catch (err) {
      console.error('Google login callback error:', err);
      res.redirect(`${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/login?error=InternalError`);
    }
  };

  // inside CustomerAuthController (or a small AuthController)
logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (refreshToken) {
      try {
        // Delete refresh token entry from Redis
        await redis.del(`refresh:${refreshToken}`);
      } catch (err) {
        console.error("Failed to delete refresh token from redis (logout):", err);
        // continue — we still clear cookie client-side
      }
    }

    // Clear cookie (manual header, matches how we set cookie earlier)
    const clearParts = [
      `refreshToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None`
    ];
    if (process.env.NODE_ENV === "production") clearParts[0] += "; Secure";
    res.setHeader("Set-Cookie", clearParts.join("; "));

    // Optionally return a message
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

}
