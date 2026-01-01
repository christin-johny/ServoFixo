import { OtpSession } from "../entities/OtpSession";
import { IBaseRepository } from "./IBaseRepository";
import { OtpContext } from "../../../../shared/types/enums/OtpContext";

export interface IOtpSessionRepository extends Pick<IBaseRepository<OtpSession>, 'create'> {
  //create(session: OtpSession): Promise<OtpSession>;
  findValidSession(
    email: string,
    sessionId: string,
    context: OtpContext
  ): Promise<OtpSession | null>;

  save(session: OtpSession): Promise<OtpSession>;

  countRecentSessions(email: string, minutes: number): Promise<number>;
}
