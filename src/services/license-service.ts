import { ApiClient } from '../api-client';
import { validateUuid, validateNotEmpty, sanitizeMetadata, validatePagination } from '../utils';
import { ValidationException } from '../exceptions';

export interface License {
  id: string;
  user_id: string;
  product_id: string;
  license_key: string;
  status: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface CreateLicenseRequest {
  user_id: string;
  product_id: string;
  metadata?: Record<string, any>;
}

export interface UpdateLicenseRequest {
  status?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface LicenseListResponse {
  data: License[];
  total: number;
  page: number;
  limit: number;
}

export interface LicenseStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  revenue: number;
}

export class LicenseService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async create(request: CreateLicenseRequest): Promise<License> {
    this.validateRequiredParams(request.user_id, request.product_id);
    
    const data = {
      user_id: request.user_id,
      product_id: request.product_id,
      metadata: sanitizeMetadata(request.metadata || {})
    };
    
    const response = await this.client.post<{ data: License }>('/licenses', data);
    return response.data;
  }

  async get(licenseId: string): Promise<License> {
    this.validateUuid(licenseId, 'license_id');
    
    const response = await this.client.get<{ data: License }>(`/licenses/${licenseId}`);
    return response.data;
  }

  async update(licenseId: string, updates: UpdateLicenseRequest): Promise<License> {
    this.validateUuid(licenseId, 'license_id');
    
    const response = await this.client.put<{ data: License }>(`/licenses/${licenseId}`, sanitizeMetadata(updates));
    return response.data;
  }

  async revoke(licenseId: string): Promise<void> {
    this.validateUuid(licenseId, 'license_id');
    
    await this.client.delete(`/licenses/${licenseId}`);
  }

  async validate(licenseKey: string): Promise<boolean> {
    validateNotEmpty(licenseKey, 'license_key');
    
    const response = await this.client.post<{ valid: boolean }>('/licenses/validate', { 
      license_key: licenseKey 
    });
    return response.valid || false;
  }

  async listUserLicenses(userId: string, page?: number, limit?: number): Promise<LicenseListResponse> {
    this.validateUuid(userId, 'user_id');
    const [validPage, validLimit] = validatePagination(page, limit);
    
    const response = await this.client.get<LicenseListResponse>('/licenses', {
      user_id: userId,
      page: validPage,
      limit: validLimit
    });
    
    return response;
  }

  async stats(): Promise<LicenseStats> {
    const response = await this.client.get<{ data: LicenseStats }>('/licenses/stats');
    return response.data;
  }

  private validateRequiredParams(userId: string, productId: string): void {
    validateNotEmpty(userId, 'user_id');
    validateNotEmpty(productId, 'product_id');
  }

  private validateUuid(id: string, fieldName: string): void {
    validateNotEmpty(id, fieldName);
    if (!validateUuid(id)) {
      throw new ValidationException(`Invalid ${fieldName} format`);
    }
  }
}
