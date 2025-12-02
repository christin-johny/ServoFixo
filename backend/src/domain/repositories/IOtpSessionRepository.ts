// backend/src/domain/repositories/IOtpSessionRepository.ts

import { OtpSession } from '../entities/OtpSession';
import { OtpContext } from '../../../../shared/types/enums/OtpContext';

export interface IOtpSessionRepository {
  create(session: OtpSession): Promise<OtpSession>;

  /**
   * Find a valid otp session by email + sessionId + context
   */
  findValidSession(
    email: string,
    sessionId: string,
    context: OtpContext
  ): Promise<OtpSession | null>;

  save(session: OtpSession): Promise<OtpSession>;
}
