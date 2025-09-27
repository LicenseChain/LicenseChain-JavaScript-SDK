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
    
    const response = await this.client.post<{ data: Webhook }>('/webhooks', data);
    return response.data;
  }

  async get(webhookId: string): Promise<Webhook> {
    this.validateUuid(webhookId, 'webhook_id');
    
    const response = await this.client.get<{ data: Webhook }>(`/webhooks/${webhookId}`);
    return response.data;
  }

  async update(webhookId: string, updates: UpdateWebhookRequest): Promise<Webhook> {
    this.validateUuid(webhookId, 'webhook_id');
    
    const response = await this.client.put<{ data: Webhook }>(`/webhooks/${webhookId}`, sanitizeMetadata(updates));
    return response.data;
  }

  async delete(webhookId: string): Promise<void> {
    this.validateUuid(webhookId, 'webhook_id');
    
    await this.client.delete(`/webhooks/${webhookId}`);
  }

  async list(): Promise<WebhookListResponse> {
    const response = await this.client.get<WebhookListResponse>('/webhooks');
    return response;
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
}
