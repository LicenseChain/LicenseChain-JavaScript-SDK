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

export class ApiClient {
  private config: Configuration;
  private baseUrl: string;

  constructor(config: Configuration) {
    this.config = config;
    this.baseUrl = config.getBaseUrl().replace(/\/$/, '');
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.makeRequest<T>('GET', endpoint, undefined, params);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, data);
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, data);
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('PATCH', endpoint, data);
  }

  async delete<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, data);
  }

  private async makeRequest<T>(
    method: string, 
    endpoint: string, 
    data?: any, 
    params?: Record<string, any>
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const requestOptions = this.buildRequestOptions(method, data);

    return retryWithBackoff(async () => {
      return this.sendRequest<T>(url, requestOptions);
    }, this.config.getRetries());
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Ensure endpoint starts with /v1 prefix
    const normalizedEndpoint = endpoint.startsWith('/v1/') 
      ? endpoint 
      : endpoint.startsWith('/') 
        ? `/v1${endpoint}`
        : `/v1/${endpoint}`;
    
    let url = `${this.baseUrl}${normalizedEndpoint}`;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }

  private buildRequestOptions(method: string, data?: any): RequestInit {
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.getApiKey()}`,
        'Content-Type': 'application/json',
        'X-API-Version': '1.0',
        'X-Platform': 'javascript-sdk',
        'User-Agent': 'LicenseChain-JavaScript-SDK/1.0.0'
      }
    };

    if (data) {
      options.body = jsonSerialize(data);
    }

    return options;
  }

  private async sendRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(this.config.getTimeout())
      });

      if (response.ok) {
        const text = await response.text();
        return text ? jsonDeserialize(text) : {} as T;
      }

      const errorText = await response.text();
      let errorMessage = 'Unknown error';
      
      try {
        const errorData = jsonDeserialize(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      this.handleHttpError(response.status, errorMessage);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }
        throw new NetworkError(error.message);
      }
      throw error;
    }
  }

  private handleHttpError(statusCode: number, message: string): never {
    switch (statusCode) {
      case 400:
        throw new ValidationError(`Bad Request: ${message}`);
      case 401:
        throw new AuthenticationError(`Unauthorized: ${message}`);
      case 403:
        throw new AuthenticationError(`Forbidden: ${message}`);
      case 404:
        throw new NotFoundError(`Not Found: ${message}`);
      case 429:
        throw new RateLimitError(`Rate Limited: ${message}`);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(`Server Error: ${message}`);
      default:
        throw new ServerError(`Unexpected response: ${statusCode} ${message}`);
    }
  }

  async ping(): Promise<any> {
    return this.get('/health');
  }

  async health(): Promise<any> {
    return this.get('/health');
  }
}
