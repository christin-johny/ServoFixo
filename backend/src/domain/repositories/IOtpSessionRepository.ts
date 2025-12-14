import { OtpSession } from "../entities/OtpSession";
import { OtpContext } from "../../../../shared/types/enums/OtpContext";

export interface IOtpSessionRepository {
  create(session: OtpSession): Promise<OtpSession>;

  findValidSession(
    email: string,
    sessionId: string,
    context: OtpContext
  ): Promise<OtpSession | null>;

  save(session: OtpSession): Promise<OtpSession>;

  countRecentSessions(email: string, minutes: number): Promise<number>;
}
