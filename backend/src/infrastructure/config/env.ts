// backend/src/infrastructure/config/env.ts

import dotenv from 'dotenv';
dotenv.config();

/**
 * env
 *
 * Central place to read environment variables for the backend.
 */
export const env = {
  jwtSecret: process.env.JWT_SECRET || 'SerVoFiXoanyWhEReYouWaNt',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};
