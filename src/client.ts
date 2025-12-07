import { Configuration, ConfigurationOptions } from './configuration';
import { ApiClient } from './api-client';
import { LicenseService } from './services/license-service';
import { UserService } from './services/user-service';
import { ProductService } from './services/product-service';
import { WebhookService } from './services/webhook-service';
import { ConfigurationException } from './exceptions';

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
      throw new ConfigurationException('API key is required');
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

  async ping(): Promise<any> {
    return this.apiClient.ping();
  }

  async health(): Promise<any> {
    return this.apiClient.health();
  }

  static create(apiKey: string, baseUrl?: string): LicenseChainClient {
    return new LicenseChainClient({
      apiKey,
      baseUrl: baseUrl || 'https://api.licensechain.app'
    });
  }

  static fromEnvironment(): LicenseChainClient {
    return new LicenseChainClient(Configuration.fromEnvironment());
  }
}