import { ApiClient } from '../api-client';
import { validateNotEmpty, sanitizeMetadata, validatePagination } from '../utils';
import { ValidationException } from '../exceptions';
import { createHash } from 'crypto';

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
  user_id?: string;
  product_id?: string;
  app_id?: string;
  plan?: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  issued_email?: string;
  expires_at?: string;
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
    const appId = request.app_id;
    if (!appId) {
      throw new ValidationException('app_id is required for API v1 license creation');
    }

    const data = {
      appId,
      plan: request.plan || 'FREE',
      issuedEmail: request.issued_email,
      expiresAt: request.expires_at
    };
    
    const response = await this.client.post<License>(`/apps/${appId}/licenses`, data);
    return this.extractLicenseResponse(response);
  }

  async get(licenseId: string): Promise<License> {
    validateNotEmpty(licenseId, 'license_id');
    
    const response = await this.client.get<License>(`/licenses/${licenseId}`);
    return this.extractLicenseResponse(response);
  }

  async update(licenseId: string, updates: UpdateLicenseRequest): Promise<License> {
    validateNotEmpty(licenseId, 'license_id');
    
    const response = await this.client.patch<License>(`/licenses/${licenseId}`, sanitizeMetadata(updates));
    return this.extractLicenseResponse(response);
  }

  async revoke(licenseId: string): Promise<void> {
    validateNotEmpty(licenseId, 'license_id');
    
    await this.client.delete(`/licenses/${licenseId}`);
  }

  async validate(licenseKey: string, hwuid?: string | null): Promise<boolean> {
    validateNotEmpty(licenseKey, 'license_key');
    const body: { key: string; hwuid?: string } = { key: licenseKey };
    body.hwuid = hwuid != null && String(hwuid).trim() !== '' ? hwuid.trim() : this.defaultHwuid();
    const response = await this.client.post<{ valid: boolean }>('/licenses/verify', body);
    return response.valid || false;
  }

  async listUserLicenses(userId: string, page?: number, limit?: number): Promise<LicenseListResponse> {
    validateNotEmpty(userId, 'user_id');
    const [validPage, validLimit] = validatePagination(page, limit);
    
    const response = await this.client.get<{ licenses?: License[]; data?: License[] }>('/licenses', {
      page: validPage,
      limit: validLimit
    });

    const allLicenses = response.licenses || response.data || [];
    const filtered = allLicenses.filter((license: any) =>
      license?.issuedEmail === userId ||
      license?.email === userId ||
      license?.user_id === userId
    );
    
    return {
      data: filtered,
      total: filtered.length,
      page: validPage,
      limit: validLimit
    };
  }

  async stats(): Promise<LicenseStats> {
    const response = await this.client.get<{ data?: LicenseStats } & LicenseStats>('/licenses/stats');
    return response.data || response;
  }

  private extractLicenseResponse(response: any): License {
    return response?.data ? response.data : response;
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
