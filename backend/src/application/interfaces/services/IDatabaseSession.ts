export interface IDatabaseSession {
  startTransaction(): void;
  commitTransaction(): Promise<void>;
  abortTransaction(): Promise<void>;
  endSession(): void;
  getNativeSession(): any; 
}