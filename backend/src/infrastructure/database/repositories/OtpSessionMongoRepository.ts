// backend/src/infrastructure/database/repositories/OtpSessionMongoRepository.ts

import { IOtpSessionRepository } from '../../../domain/repositories/IOtpSessionRepository';
import { OtpSession } from '../../../domain/entities/OtpSession';
import { OtpSessionModel, OtpSessionDocument } from '../mongoose/models/OtpSessionModel';
import { OtpContext } from '../../../../../shared/types/enums/OtpContext';

export class OtpSessionMongoRepository implements IOtpSessionRepository {
  async create(session: OtpSession): Promise<OtpSession> {
    const doc = await OtpSessionModel.create(this.toPersistence(session));
    return this.toEntity(doc);
  }

  async findValidSession(
    email: string,
    sessionId: string,
    context: OtpContext
  ): Promise<OtpSession | null> {
    const now = new Date();

    const doc = await OtpSessionModel.findOne({
      email: email.toLowerCase().trim(),
      sessionId,
      context,
      expiresAt: { $gt: now },
      used: false,
    }).exec();

    if (!doc) return null;
    return this.toEntity(doc);
  }

  async save(session: OtpSession): Promise<OtpSession> {
    const doc = await OtpSessionModel.findById(session.getId()).exec();
    if (!doc) return session;

    doc.used = session.isUsed();
    await doc.save();

    return this.toEntity(doc);
  }

  private toEntity(doc: OtpSessionDocument): OtpSession {
    return new OtpSession(
      doc._id.toString(),
      doc.email,
      doc.otp,
      doc.context,
      doc.sessionId,
      doc.expiresAt,
      doc.used,
      doc.createdAt
    );
  }

  private toPersistence(session: OtpSession) {
    return {
      email: session.getEmail(),
      otp: session.getOtp(),
      context: session.getContext(),
      sessionId: session.getSessionId(),
      expiresAt: session.getExpiresAt(),
      used: session.isUsed(),
    };
  }
}
