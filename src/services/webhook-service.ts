import { ApiClient } from '../api-client';
import { validateUuid, validateNotEmpty, sanitizeMetadata } from '../utils';
import { ValidationException } from '../exceptions';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
  secret?: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  secret?: string;
}

export interface WebhookListResponse {
  data: Webhook[];
  total: number;
  page: number;
  limit: number;
}

export class WebhookService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async create(request: CreateWebhookRequest): Promise<Webhook> {
    this.validateWebhookParams(request.url, request.events);
    
    const data = {
      url: request.url,
      events: request.events,
      secret: request.secret
    };
    
    const response = await this.client.post<{ data?: Webhook }>('/webhooks', data);
    return this.normalizeWebhookPayload((response.data || response) as any);
  }

  async get(webhookId: string): Promise<Webhook> {
    this.validateUuid(webhookId, 'webhook_id');
    
    const response = await this.client.get<{ data?: Webhook }>(`/webhooks/${webhookId}`);
    return this.normalizeWebhookPayload((response.data || response) as any);
  }

  async update(webhookId: string, updates: UpdateWebhookRequest): Promise<Webhook> {
    this.validateUuid(webhookId, 'webhook_id');
    
    const response = await this.client.put<{ data?: Webhook }>(`/webhooks/${webhookId}`, sanitizeMetadata(updates));
    return this.normalizeWebhookPayload((response.data || response) as any);
  }

  async delete(webhookId: string): Promise<void> {
    this.validateUuid(webhookId, 'webhook_id');
    
    await this.client.delete(`/webhooks/${webhookId}`);
  }

  async list(): Promise<WebhookListResponse> {
    const response = await this.client.get<any>('/webhooks');
    const data = (response?.data || []).map((webhook: any) => this.normalizeWebhookPayload(webhook));
    return {
      data,
      total: response?.pagination?.total || data.length,
      page: response?.pagination?.page || 1,
      limit: response?.pagination?.limit || data.length
    };
  }

  private validateWebhookParams(url: string, events: string[]): void {
    validateNotEmpty(url, 'url');
    if (!events || events.length === 0) {
      throw new ValidationException('Events cannot be empty');
    }
  }

  private validateUuid(id: string, fieldName: string): void {
    validateNotEmpty(id, fieldName);
    if (!validateUuid(id)) {
      throw new ValidationException(`Invalid ${fieldName} format`);
    }
  }

  private normalizeWebhookPayload(payload: any): Webhook {
    return {
      id: payload?.id,
      url: payload?.url || '',
      events: payload?.events || [],
      secret: payload?.secret,
      created_at: payload?.created_at || payload?.createdAt,
      updated_at: payload?.updated_at || payload?.updatedAt
    };
  }
}
