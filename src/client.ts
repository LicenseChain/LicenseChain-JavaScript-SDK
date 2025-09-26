/**
 * LicenseChain JavaScript SDK Client
 * 
 * Main client for interacting with the LicenseChain API.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  LicenseChainConfig,
  User,
  Application,
  License,
  Webhook,
  Analytics,
  PaginatedResponse,
  ValidationResult,
  CreateLicenseRequest,
  UpdateLicenseRequest,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  ListOptions,
  LicenseListOptions,
  ApplicationListOptions,
  WebhookListOptions,
  AnalyticsOptions,
  UsageStatsOptions,
  ApiResponse,
  RequestOptions,
} from './types';
import {
  LicenseChainException,
  createErrorFromResponse,
  isRetryableError,
} from './exceptions';

export class LicenseChainClient {
  private axiosInstance: AxiosInstance;
  private config: LicenseChainConfig;

  constructor(config: LicenseChainConfig) {
    if (!config.apiKey) {
      throw new LicenseChainException('API key is required');
    }

    this.config = {
      baseUrl: 'https://api.licensechain.app',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'User-Agent': 'LicenseChain-JavaScript-SDK/1.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response && isRetryableError(createErrorFromResponse(
          error.response.status,
          error.response.data?.error || error.message,
          error.response.data?.code,
          error.response.data?.details
        ))) {
          if (!originalRequest._retryCount) {
            originalRequest._retryCount = 0;
          }

          if (originalRequest._retryCount < this.config.retryAttempts!) {
            originalRequest._retryCount++;
            
            await new Promise(resolve => 
              setTimeout(resolve, this.config.retryDelay! * Math.pow(2, originalRequest._retryCount - 1))
            );

            return this.axiosInstance(originalRequest);
          }
        }

        if (error.response) {
          const statusCode = error.response.status;
          const errorData = error.response.data;
          throw createErrorFromResponse(
            statusCode,
            errorData?.error || error.message,
            errorData?.code,
            errorData?.details
          );
        } else if (error.request) {
          throw new LicenseChainException('Network error', 'NETWORK_ERROR', undefined, {
            message: error.message,
            code: error.code,
          });
        } else {
          throw new LicenseChainException('Request error', 'REQUEST_ERROR', undefined, {
            message: error.message,
          });
        }
      }
    );
  }

  // Authentication Methods

  async registerUser(userData: {
    email: string;
    password: string;
    name?: string;
    company?: string;
  }): Promise<User> {
    const response = await this.axiosInstance.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string; refreshToken: string }> {
    const response = await this.axiosInstance.post('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.axiosInstance.post('/auth/logout');
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await this.axiosInstance.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async getUserProfile(): Promise<User> {
    const response = await this.axiosInstance.get('/auth/me');
    return response.data;
  }

  async updateUserProfile(attributes: Partial<User>): Promise<User> {
    const response = await this.axiosInstance.patch('/auth/me', attributes);
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await this.axiosInstance.patch('/auth/password', data);
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.axiosInstance.post('/auth/forgot-password', { email });
  }

  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    await this.axiosInstance.post('/auth/reset-password', data);
  }

  // Application Management

  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    const response = await this.axiosInstance.post('/apps', data);
    return response.data;
  }

  async listApplications(options: ApplicationListOptions = {}): Promise<PaginatedResponse<Application>> {
    const params = this.buildListParams(options);
    const response = await this.axiosInstance.get('/apps', { params });
    return response.data;
  }

  async getApplication(appId: string): Promise<Application> {
    const response = await this.axiosInstance.get(`/apps/${appId}`);
    return response.data;
  }

  async updateApplication(appId: string, data: UpdateApplicationRequest): Promise<Application> {
    const response = await this.axiosInstance.patch(`/apps/${appId}`, data);
    return response.data;
  }

  async deleteApplication(appId: string): Promise<void> {
    await this.axiosInstance.delete(`/apps/${appId}`);
  }

  async regenerateApiKey(appId: string): Promise<{ apiKey: string }> {
    const response = await this.axiosInstance.post(`/apps/${appId}/regenerate-key`);
    return response.data;
  }

  // License Management

  async createLicense(data: CreateLicenseRequest): Promise<License> {
    const response = await this.axiosInstance.post('/licenses', data);
    return response.data;
  }

  async listLicenses(options: LicenseListOptions = {}): Promise<PaginatedResponse<License>> {
    const params = this.buildListParams(options);
    const response = await this.axiosInstance.get('/licenses', { params });
    return response.data;
  }

  async getLicense(licenseId: string): Promise<License> {
    const response = await this.axiosInstance.get(`/licenses/${licenseId}`);
    return response.data;
  }

  async updateLicense(licenseId: string, data: UpdateLicenseRequest): Promise<License> {
    const response = await this.axiosInstance.patch(`/licenses/${licenseId}`, data);
    return response.data;
  }

  async deleteLicense(licenseId: string): Promise<void> {
    await this.axiosInstance.delete(`/licenses/${licenseId}`);
  }

  async validateLicense(licenseKey: string, appId?: string): Promise<ValidationResult> {
    const response = await this.axiosInstance.post('/licenses/validate', {
      licenseKey,
      appId,
    });
    return response.data;
  }

  async revokeLicense(licenseId: string, reason?: string): Promise<void> {
    await this.axiosInstance.patch(`/licenses/${licenseId}/revoke`, { reason });
  }

  async activateLicense(licenseId: string): Promise<void> {
    await this.axiosInstance.patch(`/licenses/${licenseId}/activate`);
  }

  async extendLicense(licenseId: string, expiresAt: string): Promise<void> {
    await this.axiosInstance.patch(`/licenses/${licenseId}/extend`, { expiresAt });
  }

  // Webhook Management

  async createWebhook(data: CreateWebhookRequest): Promise<Webhook> {
    const response = await this.axiosInstance.post('/webhooks', data);
    return response.data;
  }

  async listWebhooks(options: WebhookListOptions = {}): Promise<PaginatedResponse<Webhook>> {
    const params = this.buildListParams(options);
    const response = await this.axiosInstance.get('/webhooks', { params });
    return response.data;
  }

  async getWebhook(webhookId: string): Promise<Webhook> {
    const response = await this.axiosInstance.get(`/webhooks/${webhookId}`);
    return response.data;
  }

  async updateWebhook(webhookId: string, data: UpdateWebhookRequest): Promise<Webhook> {
    const response = await this.axiosInstance.patch(`/webhooks/${webhookId}`, data);
    return response.data;
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.axiosInstance.delete(`/webhooks/${webhookId}`);
  }

  async testWebhook(webhookId: string): Promise<void> {
    await this.axiosInstance.post(`/webhooks/${webhookId}/test`);
  }

  // Analytics

  async getAnalytics(options: AnalyticsOptions = {}): Promise<Analytics> {
    const params = this.buildAnalyticsParams(options);
    const response = await this.axiosInstance.get('/analytics', { params });
    return response.data;
  }

  async getLicenseAnalytics(licenseId: string): Promise<Analytics> {
    const response = await this.axiosInstance.get(`/licenses/${licenseId}/analytics`);
    return response.data;
  }

  async getUsageStats(options: UsageStatsOptions = {}): Promise<Analytics> {
    const params = this.buildUsageStatsParams(options);
    const response = await this.axiosInstance.get('/analytics/usage', { params });
    return response.data;
  }

  // System Status

  async getSystemStatus(): Promise<{ status: string; services: any[] }> {
    const response = await this.axiosInstance.get('/status');
    return response.data;
  }

  async getHealthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.axiosInstance.get('/health');
    return response.data;
  }

  // Utility Methods

  private buildListParams(options: ListOptions): Record<string, any> {
    const params: Record<string, any> = {
      page: options.page || 1,
      limit: options.limit || 20,
    };

    if (options.sortBy) {
      params.sortBy = options.sortBy;
    }

    if (options.sortOrder) {
      params.sortOrder = options.sortOrder;
    }

    if (options.filter) {
      Object.assign(params, options.filter);
    }

    return params;
  }

  private buildAnalyticsParams(options: AnalyticsOptions): Record<string, any> {
    const params: Record<string, any> = {};

    if (options.appId) {
      params.appId = options.appId;
    }

    if (options.startDate) {
      params.startDate = options.startDate;
    }

    if (options.endDate) {
      params.endDate = options.endDate;
    }

    if (options.metric) {
      params.metric = options.metric;
    }

    if (options.period) {
      params.period = options.period;
    }

    return params;
  }

  private buildUsageStatsParams(options: UsageStatsOptions): Record<string, any> {
    const params: Record<string, any> = {
      period: options.period || '30d',
    };

    if (options.appId) {
      params.appId = options.appId;
    }

    if (options.granularity) {
      params.granularity = options.granularity;
    }

    return params;
  }

  // HTTP Methods

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  // Configuration

  updateConfig(newConfig: Partial<LicenseChainConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.apiKey) {
      this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${newConfig.apiKey}`;
    }
    
    if (newConfig.baseUrl) {
      this.axiosInstance.defaults.baseURL = newConfig.baseUrl;
    }
    
    if (newConfig.timeout) {
      this.axiosInstance.defaults.timeout = newConfig.timeout;
    }
  }

  getConfig(): LicenseChainConfig {
    return { ...this.config };
  }
}
