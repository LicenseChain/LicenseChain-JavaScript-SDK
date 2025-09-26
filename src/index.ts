/**
 * LicenseChain JavaScript SDK
 * 
 * Official JavaScript SDK for LicenseChain - a comprehensive license management platform.
 */

export { LicenseChainClient } from './client';
export { LicenseValidator } from './license-validator';
export { WebhookVerifier, WebhookHandler } from './webhook-verifier';

// Models
export type {
  User,
  Application,
  License,
  Webhook,
  Analytics,
  PaginatedResponse,
  ValidationResult,
  LicenseChainConfig,
} from './types';

// Exceptions
export {
  LicenseChainException,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  NetworkError,
} from './exceptions';

// Version
export const VERSION = '1.0.0';
