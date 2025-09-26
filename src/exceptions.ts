/**
 * LicenseChain JavaScript SDK Exceptions
 * 
 * Custom exceptions for the LicenseChain JavaScript SDK.
 */

export class LicenseChainException extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly details?: Record<string, any>;

  constructor(
    message: string = 'LicenseChain error occurred',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'LicenseChainException';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LicenseChainException);
    }
  }
}

export class AuthenticationError extends LicenseChainException {
  constructor(
    message: string = 'Authentication failed',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message, code, statusCode, details);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends LicenseChainException {
  constructor(
    message: string = 'Validation failed',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message, code, statusCode, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends LicenseChainException {
  constructor(
    message: string = 'Resource not found',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message, code, statusCode, details);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends LicenseChainException {
  public readonly retryAfter?: number;
  public readonly limit?: number;
  public readonly remaining?: number;
  public readonly reset?: number;

  constructor(
    message: string = 'Rate limit exceeded',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>,
    retryAfter?: number,
    limit?: number,
    remaining?: number,
    reset?: number
  ) {
    super(message, code, statusCode, details);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
    this.reset = reset;
  }
}

export class ServerError extends LicenseChainException {
  constructor(
    message: string = 'Server error',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message, code, statusCode, details);
    this.name = 'ServerError';
  }
}

export class NetworkError extends LicenseChainException {
  constructor(
    message: string = 'Network error',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message, code, statusCode, details);
    this.name = 'NetworkError';
  }
}

export class WebhookVerificationError extends LicenseChainException {
  constructor(
    message: string = 'Webhook verification failed',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message, code, statusCode, details);
    this.name = 'WebhookVerificationError';
  }
}

export class LicenseValidationError extends LicenseChainException {
  constructor(
    message: string = 'License validation failed',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message, code, statusCode, details);
    this.name = 'LicenseValidationError';
  }
}

export class ConfigurationError extends LicenseChainException {
  constructor(
    message: string = 'Configuration error',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message, code, statusCode, details);
    this.name = 'ConfigurationError';
  }
}

export class TimeoutError extends LicenseChainException {
  constructor(
    message: string = 'Request timeout',
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message, code, statusCode, details);
    this.name = 'TimeoutError';
  }
}

/**
 * Error factory for creating appropriate exceptions based on HTTP status codes
 */
export function createErrorFromResponse(
  statusCode: number,
  message: string,
  code?: string,
  details?: Record<string, any>
): LicenseChainException {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, code, statusCode, details);
    case 401:
    case 403:
      return new AuthenticationError(message, code, statusCode, details);
    case 404:
      return new NotFoundError(message, code, statusCode, details);
    case 429:
      return new RateLimitError(message, code, statusCode, details);
    case 408:
      return new TimeoutError(message, code, statusCode, details);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, code, statusCode, details);
    default:
      if (statusCode >= 400 && statusCode < 500) {
        return new ValidationError(message, code, statusCode, details);
      } else if (statusCode >= 500) {
        return new ServerError(message, code, statusCode, details);
      } else {
        return new LicenseChainException(message, code, statusCode, details);
      }
  }
}

/**
 * Check if an error is a LicenseChain exception
 */
export function isLicenseChainError(error: any): error is LicenseChainException {
  return error instanceof LicenseChainException;
}

/**
 * Check if an error is a retryable error
 */
export function isRetryableError(error: any): boolean {
  if (!isLicenseChainError(error)) {
    return false;
  }

  // Retry on network errors, server errors, and rate limits
  return (
    error instanceof NetworkError ||
    error instanceof ServerError ||
    error instanceof RateLimitError ||
    error instanceof TimeoutError
  );
}
