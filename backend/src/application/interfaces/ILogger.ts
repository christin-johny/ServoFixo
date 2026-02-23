export interface ILogger { 
  error(message: string, trace?: string, context?: object): void;
  warn(message: string, context?: object): void;
  debug(message: string, context?: object): void;
}