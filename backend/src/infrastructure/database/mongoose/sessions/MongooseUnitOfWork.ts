import mongoose from "mongoose";
import { IUnitOfWork } from "../../../../application/interfaces/services/IUnitOfWork";
import { IDatabaseSession } from "../../../../application/interfaces/services/IDatabaseSession";
import { MongooseSession } from "./MongooseSession";

export class MongooseUnitOfWork implements IUnitOfWork {
  async createSession(): Promise<IDatabaseSession> {
    const rawSession = await mongoose.startSession();
    return new MongooseSession(rawSession);  
  }
}