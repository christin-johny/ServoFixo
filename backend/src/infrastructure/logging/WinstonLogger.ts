import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ILogger } from '../../application/interfaces/ILogger';

export class WinstonLogger implements ILogger {
private logger: winston.Logger;

  constructor() {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    );

    const errorTransport = new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, 
      maxSize: '5m',     
      maxFiles: '3d',     
      level: 'error',
    });

    const combinedTransport = new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '5m',       
      maxFiles: '3d',     
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        errorTransport,
        combinedTransport,
      ],
    });
  }

  info(message: string, context?: object): void {
    this.logger.info(message, { ...context });
  }

  error(message: string, trace?: string, context?: object): void {
    this.logger.error(message, { trace, ...context });
  }

  warn(message: string, context?: object): void {
    this.logger.warn(message, { ...context });
  }

  debug(message: string, context?: object): void {
    this.logger.debug(message, { ...context });
  }
}