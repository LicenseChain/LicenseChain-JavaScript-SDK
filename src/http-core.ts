export type HttpExceptionFactory = {
  authentication: (message: string) => Error;
  network: (message: string) => Error;
  notFound: (message: string) => Error;
  rateLimit: (message: string) => Error;
  server: (message: string) => Error;
  validation: (message: string) => Error;
};

export type HttpRuntime = {
  apiKey: string;
  baseUrl: string;
  deserialize: (text: string) => any;
  exceptions: HttpExceptionFactory;
  platform: string;
  retries: number;
  retryWithBackoff: <T>(fn: () => Promise<T>, maxRetries: number) => Promise<T>;
  serialize: (value: any) => string;
  timeout: number;
  userAgent: string;
};

export class LicenseChainHttpCore {
  private readonly baseUrl: string;

  constructor(private readonly runtime: HttpRuntime) {
    this.baseUrl = runtime.baseUrl.replace(/\/$/, '');
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

    return this.runtime.retryWithBackoff(async () => {
      return this.sendRequest<T>(url, requestOptions);
    }, this.runtime.retries);
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const baseHasV1 = this.baseUrl.endsWith('/v1');
    const normalizedEndpoint = endpoint.startsWith('/v1/')
      ? (baseHasV1 ? endpoint.slice(3) : endpoint)
      : endpoint.startsWith('/')
        ? (baseHasV1 ? endpoint : `/v1${endpoint}`)
        : (baseHasV1 ? `/${endpoint}` : `/v1/${endpoint}`);

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
        Authorization: `Bearer ${this.runtime.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': this.runtime.userAgent,
        'X-API-Version': '1.0',
        'X-Platform': this.runtime.platform,
      },
    };

    if (data !== undefined) {
      options.body = this.runtime.serialize(data);
    }

    return options;
  }

  private async sendRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(this.runtime.timeout),
      });

      if (response.ok) {
        const text = await response.text();
        return text ? this.runtime.deserialize(text) : ({} as T);
      }

      const errorText = await response.text();
      let errorMessage = 'Unknown error';

      try {
        const errorData = this.runtime.deserialize(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      this.handleHttpError(response.status, errorMessage);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.runtime.exceptions.network('Request timeout');
        }
        throw this.runtime.exceptions.network(error.message);
      }
      throw error;
    }
  }

  private handleHttpError(statusCode: number, message: string): never {
    switch (statusCode) {
      case 400:
        throw this.runtime.exceptions.validation(`Bad Request: ${message}`);
      case 401:
      case 403:
        throw this.runtime.exceptions.authentication(`Unauthorized: ${message}`);
      case 404:
        throw this.runtime.exceptions.notFound(`Not Found: ${message}`);
      case 429:
        throw this.runtime.exceptions.rateLimit(`Rate Limited: ${message}`);
      case 500:
      case 502:
      case 503:
      case 504:
        throw this.runtime.exceptions.server(`Server Error: ${message}`);
      default:
        throw this.runtime.exceptions.server(`Unexpected response: ${statusCode} ${message}`);
    }
  }
}
