import { ApiClient } from '../api-client';
import { validateUuid, validateNotEmpty, validatePositive, validateCurrency, sanitizeMetadata, validatePagination } from '../utils';
import { ValidationException } from '../exceptions';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductStats {
  total: number;
  active: number;
  revenue: number;
}

export class ProductService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async create(request: CreateProductRequest): Promise<Product> {
    this.validateRequiredParams(request.name, request.price, request.currency);
    
    const data = {
      name: request.name,
      description: request.description,
      price: request.price,
      currency: request.currency,
      metadata: sanitizeMetadata(request.metadata || {})
    };
    
    const response = await this.client.post<{ data: Product }>('/products', data);
    return response.data;
  }

  async get(productId: string): Promise<Product> {
    this.validateUuid(productId, 'product_id');
    
    const response = await this.client.get<{ data: Product }>(`/products/${productId}`);
    return response.data;
  }

  async update(productId: string, updates: UpdateProductRequest): Promise<Product> {
    this.validateUuid(productId, 'product_id');
    
    const response = await this.client.put<{ data: Product }>(`/products/${productId}`, sanitizeMetadata(updates));
    return response.data;
  }

  async delete(productId: string): Promise<void> {
    this.validateUuid(productId, 'product_id');
    
    await this.client.delete(`/products/${productId}`);
  }

  async list(page?: number, limit?: number): Promise<ProductListResponse> {
    const [validPage, validLimit] = validatePagination(page, limit);
    
    const response = await this.client.get<ProductListResponse>('/products', {
      page: validPage,
      limit: validLimit
    });
    
    return response;
  }

  async stats(): Promise<ProductStats> {
    const response = await this.client.get<{ data: ProductStats }>('/products/stats');
    return response.data;
  }

  private validateRequiredParams(name: string, price: number, currency: string): void {
    validateNotEmpty(name, 'name');
    if (price !== undefined) {
      validatePositive(price, 'price');
    }
    if (!validateCurrency(currency)) {
      throw new ValidationException('Invalid currency');
    }
  }

  private validateUuid(id: string, fieldName: string): void {
    validateNotEmpty(id, fieldName);
    if (!validateUuid(id)) {
      throw new ValidationException(`Invalid ${fieldName} format`);
    }
  }
}
