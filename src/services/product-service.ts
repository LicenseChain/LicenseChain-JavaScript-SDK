import { ApiClient } from '../api-client';
import { validateNotEmpty, validatePositive, validateCurrency, validatePagination } from '../utils';
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
    throw new ValidationException('Product endpoints are not available in API v1');
  }

  async get(productId: string): Promise<Product> {
    validateNotEmpty(productId, 'product_id');
    throw new ValidationException('Product endpoints are not available in API v1');
  }

  async update(productId: string, updates: UpdateProductRequest): Promise<Product> {
    validateNotEmpty(productId, 'product_id');
    throw new ValidationException('Product endpoints are not available in API v1');
  }

  async delete(productId: string): Promise<void> {
    validateNotEmpty(productId, 'product_id');
    throw new ValidationException('Product endpoints are not available in API v1');
  }

  async list(page?: number, limit?: number): Promise<ProductListResponse> {
    const [validPage, validLimit] = validatePagination(page, limit);
    
    return {
      data: [],
      total: 0,
      page: validPage,
      limit: validLimit
    };
  }

  async stats(): Promise<ProductStats> {
    return { total: 0, active: 0, revenue: 0 };
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

}
