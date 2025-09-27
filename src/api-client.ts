import { Configuration } from './configuration';
import { retryWithBackoff, jsonSerialize, jsonDeserialize } from './utils';
import { 
  NetworkException, 
  ServerException, 
  ValidationException, 
  AuthenticationException, 
  NotFoundException, 
  RateLimitException 
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
    let url = `${this.baseUrl}/${endpoint}`.replace(/\/+/g, '/');
    
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
          throw new NetworkException('Request timeout');
        }
        throw new NetworkException(error.message);
      }
      throw error;
    }
  }

  private handleHttpError(statusCode: number, message: string): never {
    switch (statusCode) {
      case 400:
        throw new ValidationException(`Bad Request: ${message}`);
      case 401:
        throw new AuthenticationException(`Unauthorized: ${message}`);
      case 403:
        throw new AuthenticationException(`Forbidden: ${message}`);
      case 404:
        throw new NotFoundException(`Not Found: ${message}`);
      case 429:
        throw new RateLimitException(`Rate Limited: ${message}`);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerException(`Server Error: ${message}`);
      default:
        throw new ServerException(`Unexpected response: ${statusCode} ${message}`);
    }
  }

  async ping(): Promise<any> {
    return this.get('/ping');
  }

  async health(): Promise<any> {
    return this.get('/health');
  }
}
