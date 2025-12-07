import { ApiClient } from '../api-client';
import { validateUuid, validateNotEmpty, validateEmail, sanitizeMetadata, validatePagination } from '../utils';
import { ValidationException } from '../exceptions';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  metadata?: Record<string, any>;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
}

export class UserService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async create(request: CreateUserRequest): Promise<User> {
    this.validateEmail(request.email);
    
    const data = {
      email: request.email,
      name: request.name,
      metadata: sanitizeMetadata(request.metadata || {})
    };
    
    const response = await this.client.post<{ data: User }>('/users', data);
    return response.data;
  }

  async get(userId: string): Promise<User> {
    this.validateUuid(userId, 'user_id');
    
    const response = await this.client.get<{ data: User }>(`/users/${userId}`);
    return response.data;
  }

  async update(userId: string, updates: UpdateUserRequest): Promise<User> {
    this.validateUuid(userId, 'user_id');
    
    const response = await this.client.put<{ data: User }>(`/users/${userId}`, sanitizeMetadata(updates));
    return response.data;
  }

  async delete(userId: string): Promise<void> {
    this.validateUuid(userId, 'user_id');
    
    await this.client.delete(`/users/${userId}`);
  }

  async list(page?: number, limit?: number): Promise<UserListResponse> {
    const [validPage, validLimit] = validatePagination(page, limit);
    
    const response = await this.client.get<UserListResponse>('/users', {
      page: validPage,
      limit: validLimit
    });
    
    return response;
  }

  async stats(): Promise<UserStats> {
    const response = await this.client.get<{ data: UserStats }>('/users/stats');
    return response.data;
  }

  private validateEmail(email: string): void {
    validateNotEmpty(email, 'email');
    if (!validateEmail(email)) {
      throw new ValidationException('Invalid email format');
    }
  }

  private validateUuid(id: string, fieldName: string): void {
    validateNotEmpty(id, fieldName);
    if (!validateUuid(id)) {
      throw new ValidationException(`Invalid ${fieldName} format`);
    }
  }
}
