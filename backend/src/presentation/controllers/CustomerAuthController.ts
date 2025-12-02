import type { Request, Response } from 'express';
import { RequestCustomerRegistrationOtpUseCase } from '../../application/use-cases/auth/RequestCustomerRegistrationOtpUseCase';
import { VerifyCustomerRegistrationOtpUseCase } from '../../application/use-cases/auth/VerifyCustomerRegistrationOtpUseCase';
import { CustomerLoginUseCase } from '../../application/use-cases/auth/CustomerLoginUseCase';
import { ErrorMessages } from '../../../../shared/types/enums/ErrorMessages';
import { StatusCodes } from '../../../../shared/types/enums/StatusCodes';

export class CustomerAuthController {
  constructor(
    private readonly requestRegisterOtpUseCase: RequestCustomerRegistrationOtpUseCase,
    private readonly verifyRegisterOtpUseCase: VerifyCustomerRegistrationOtpUseCase,
    private readonly customerLoginUseCase: CustomerLoginUseCase
  ) {}

  // 1️⃣ Registration - Step 1: send OTP
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

  // 2️⃣ Registration - Step 2: verify OTP + create user
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

      return res.status(StatusCodes.OK).json({
        message: 'Registration successful',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
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

  // 3️⃣ Login with email + password
  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const result = await this.customerLoginUseCase.execute({ email, password });

      return res.status(StatusCodes.OK).json({
        message: 'Login successful',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
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
}
