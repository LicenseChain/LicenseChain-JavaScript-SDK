export interface ConfigurationOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export class Configuration {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(options: ConfigurationOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.licensechain.app';
    this.timeout = options.timeout || 30000; // 30 seconds
    this.retries = options.retries || 3;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getTimeout(): number {
    return this.timeout;
  }

  getRetries(): number {
    return this.retries;
  }

  isValid(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  setApiKey(apiKey: string): this {
    this.apiKey = apiKey;
    return this;
  }

  setBaseUrl(baseUrl: string): this {
    this.baseUrl = baseUrl;
    return this;
  }

  setTimeout(timeout: number): this {
    this.timeout = timeout;
    return this;
  }

  setRetries(retries: number): this {
    this.retries = retries;
    return this;
  }

  toObject(): ConfigurationOptions {
    return {
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retries: this.retries
    };
  }

  static fromObject(config: ConfigurationOptions): Configuration {
    return new Configuration(config);
  }

  static fromEnvironment(): Configuration {
    return new Configuration({
      apiKey: process.env.LICENSECHAIN_API_KEY || '',
      baseUrl: process.env.LICENSECHAIN_BASE_URL || 'https://api.licensechain.app',
      timeout: parseInt(process.env.LICENSECHAIN_TIMEOUT || '30000'),
      retries: parseInt(process.env.LICENSECHAIN_RETRIES || '3')
    });
  }
}
