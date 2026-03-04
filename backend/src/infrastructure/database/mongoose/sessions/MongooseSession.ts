import { ClientSession } from "mongoose";
import { IDatabaseSession } from "../../../../application/interfaces/services/IDatabaseSession";

export class MongooseSession implements IDatabaseSession {
  constructor(private readonly _session: ClientSession) {}

  startTransaction(): void { this._session.startTransaction(); }
  async commitTransaction(): Promise<void> { await this._session.commitTransaction(); }
  async abortTransaction(): Promise<void> { await this._session.abortTransaction(); }
  endSession(): void { this._session.endSession(); }
 
  getNativeSession(): ClientSession {
    return this._session;
  }
}