import { ApiClient } from '../api-client';
import { validateNotEmpty, validateEmail, sanitizeMetadata, validatePagination } from '../utils';
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
  password?: string;
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
      password: request.password || 'ChangeMe123!',
      name: request.name,
      metadata: sanitizeMetadata(request.metadata || {})
    };
    
    const response = await this.client.post<{ user?: User; data?: User }>('/auth/register', data);
    return (response.user || response.data) as User;
  }

  async get(userId: string): Promise<User> {
    validateNotEmpty(userId, 'user_id');
    
    const response = await this.client.get<{ data?: User } & User>('/auth/me');
    return (response.data || response) as User;
  }

  async update(userId: string, updates: UpdateUserRequest): Promise<User> {
    validateNotEmpty(userId, 'user_id');
    throw new ValidationException('User update endpoint is not available in API v1');
  }

  async delete(userId: string): Promise<void> {
    validateNotEmpty(userId, 'user_id');
    throw new ValidationException('User delete endpoint is not available in API v1');
  }

  async list(page?: number, limit?: number): Promise<UserListResponse> {
    const [validPage, validLimit] = validatePagination(page, limit);
    
    return {
      data: [],
      total: 0,
      page: validPage,
      limit: validLimit
    };
  }

  async stats(): Promise<UserStats> {
    return { total: 0, active: 0, inactive: 0 };
  }

  private validateEmail(email: string): void {
    validateNotEmpty(email, 'email');
    if (!validateEmail(email)) {
      throw new ValidationException('Invalid email format');
    }
  }

}
