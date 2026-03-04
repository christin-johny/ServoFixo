import { IDatabaseSession } from "./IDatabaseSession";
export interface IUnitOfWork {
  createSession(): Promise<IDatabaseSession>;
}