// Main exports
export { LicenseChainClient } from './client';
export { Configuration } from './configuration';
export type { ConfigurationOptions } from './configuration';
export { ApiClient } from './api-client';

// Services
export { LicenseService } from './services/license-service';
export { UserService } from './services/user-service';
export { ProductService } from './services/product-service';
export { WebhookService } from './services/webhook-service';

// Webhook handling
export { WebhookHandler, WebhookEvents, createOutgoingWebhookSignature, verifyIncomingWebhookSignature } from './webhook-handler';

// License validation
export { LicenseValidator } from './license-validator';

// License assertion JWT (RS256 + JWKS) — parity with licensechain-node-sdk root exports
export {
  LICENSE_TOKEN_USE_CLAIM,
  verifyLicenseAssertionJwt,
} from './license-assertion';
export type { VerifyLicenseAssertionOptions } from './license-assertion';

// Types
export * from './types';

// Exceptions
export * from './exceptions';

// Utilities
export * from './utils';

// Default export
export { LicenseChainClient as default } from './client';