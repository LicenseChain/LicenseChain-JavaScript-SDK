import { Configuration, ConfigurationOptions } from './configuration';
import { ApiClient } from './api-client';
import { LicenseService } from './services/license-service';
import { UserService } from './services/user-service';
import { ProductService } from './services/product-service';
import { WebhookService } from './services/webhook-service';
import { ConfigurationError } from './exceptions';
import { createHash } from 'crypto';

export class LicenseChainClient {
  private config: Configuration;
  private apiClient: ApiClient;
  private licenses: LicenseService;
  private users: UserService;
  private products: ProductService;
  private webhooks: WebhookService;

  constructor(config: Configuration | ConfigurationOptions) {
    if (config instanceof Configuration) {
      this.config = config;
    } else {
      this.config = new Configuration(config);
    }

    if (!this.config.isValid()) {
      throw new ConfigurationError('API key is required');
    }

    this.apiClient = new ApiClient(this.config);
    this.licenses = new LicenseService(this.apiClient);
    this.users = new UserService(this.apiClient);
    this.products = new ProductService(this.apiClient);
    this.webhooks = new WebhookService(this.apiClient);
  }

  getConfiguration(): Configuration {
    return this.config;
  }

  getLicenses(): LicenseService {
    return this.licenses;
  }

  getUsers(): UserService {
    return this.users;
  }

  getProducts(): ProductService {
    return this.products;
  }

  getWebhooks(): WebhookService {
    return this.webhooks;
  }

  async validateLicense(licenseKey: string, hwuid?: string): Promise<{ valid: boolean }> {
    const resolvedHwuid = hwuid && hwuid.trim() !== '' ? hwuid.trim() : this.defaultHwuid();
    const valid = await this.licenses.validate(licenseKey, resolvedHwuid);
    return { valid };
  }

  async ping(): Promise<any> {
    return this.apiClient.ping();
  }

  async health(): Promise<any> {
    return this.apiClient.health();
  }

  static create(apiKey: string, baseUrl?: string): LicenseChainClient {
    return new LicenseChainClient({
      apiKey,
      baseUrl: baseUrl || 'https://api.licensechain.app/v1'
    });
  }

  static fromEnvironment(): LicenseChainClient {
    return new LicenseChainClient(Configuration.fromEnvironment());
  }

  updateConfig(config: {
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    retries?: number;
  }): void {
    if (config.apiKey) this.config.setApiKey(config.apiKey);
    if (config.baseUrl) this.config.setBaseUrl(config.baseUrl);
    if (typeof config.timeout === 'number') this.config.setTimeout(config.timeout);
    if (typeof config.retries === 'number') this.config.setRetries(config.retries);

    this.apiClient = new ApiClient(this.config);
    this.licenses = new LicenseService(this.apiClient);
    this.users = new UserService(this.apiClient);
    this.products = new ProductService(this.apiClient);
    this.webhooks = new WebhookService(this.apiClient);
  }

  private defaultHwuid(): string {
    const g: any = globalThis as any;
    if (g?.navigator) {
      return createHash('sha256')
        .update(`licensechain|js-browser|${g.navigator.userAgent}|${g.navigator.language}|${g.navigator.platform || 'unknown'}`)
        .digest('hex');
    }
    if (typeof process !== 'undefined') {
      return createHash('sha256')
        .update(`licensechain|js-node|${process.platform}|${process.arch}|${process.version}`)
        .digest('hex');
    }
    return createHash('sha256').update('licensechain|js|unknown|unknown|unknown').digest('hex');
  }
}