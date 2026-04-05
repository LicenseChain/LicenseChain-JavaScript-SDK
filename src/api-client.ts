import { Configuration } from './configuration';
import { retryWithBackoff, jsonSerialize, jsonDeserialize } from './utils';
import { 
  NetworkError, 
  ServerError, 
  ValidationError, 
  AuthenticationError, 
  NotFoundError, 
  RateLimitError 
} from './exceptions';
import { LicenseChainHttpCore } from './http-core';

export class ApiClient {
  private readonly core: LicenseChainHttpCore;

  constructor(config: Configuration) {
    this.core = new LicenseChainHttpCore({
      apiKey: config.getApiKey(),
      baseUrl: config.getBaseUrl(),
      deserialize: jsonDeserialize,
      exceptions: {
        authentication: (message) => new AuthenticationError(message),
        network: (message) => new NetworkError(message),
        notFound: (message) => new NotFoundError(message),
        rateLimit: (message) => new RateLimitError(message),
        server: (message) => new ServerError(message),
        validation: (message) => new ValidationError(message),
      },
      platform: 'javascript-sdk',
      retries: config.getRetries(),
      retryWithBackoff,
      serialize: jsonSerialize,
      timeout: config.getTimeout(),
      userAgent: 'LicenseChain-JavaScript-SDK/1.0.0',
    });
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.core.get<T>(endpoint, params);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.core.post<T>(endpoint, data);
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.core.put<T>(endpoint, data);
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.core.patch<T>(endpoint, data);
  }

  async delete<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.core.delete<T>(endpoint, data);
  }

  async ping(): Promise<any> {
    return this.get('/health');
  }

  async health(): Promise<any> {
    return this.get('/health');
  }
}
