// Main exports
export { LicenseChainClient } from './client';
export { Configuration, ConfigurationOptions } from './configuration';
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

// Types
export * from './types';

// Exceptions
export * from './exceptions';

// Utilities
export * from './utils';

// Default export
export { LicenseChainClient as default } from './client';