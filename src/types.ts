/**
 * TypeScript type definitions for LicenseChain JavaScript SDK
 */

export interface LicenseChainConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface User {
  id?: string;
  email: string;
  name?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
  emailVerified?: boolean;
  status?: string;
}

export interface Application {
  id?: string;
  name: string;
  description?: string;
  apiKey?: string;
  webhookUrl?: string;
  allowedOrigins?: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  licenseCount?: number;
}

export interface License {
  id?: string;
  key?: string;
  appId: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  status?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
  features?: string[];
  usageCount?: number;
}

export interface Webhook {
  id?: string;
  appId: string;
  url: string;
  events?: string[];
  secret?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  lastTriggeredAt?: string;
  failureCount?: number;
}

export interface Analytics {
  totalLicenses?: number;
  activeLicenses?: number;
  expiredLicenses?: number;
  revokedLicenses?: number;
  validationsToday?: number;
  validationsThisWeek?: number;
  validationsThisMonth?: number;
  topFeatures?: string[];
  usageByDay?: Array<Record<string, any>>;
  usageByWeek?: Array<Record<string, any>>;
  usageByMonth?: Array<Record<string, any>>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ValidationResult {
  valid: boolean;
  license?: Record<string, any>;
  user?: Record<string, any>;
  app?: Record<string, any>;
  expiresAt?: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  createdAt: string;
  data: Record<string, any>;
}

export interface WebhookPayload {
  id: string;
  type: string;
  createdAt: string;
  data: Record<string, any>;
  signature?: string;
}

export interface LicenseValidationRules {
  maxUsage?: number;
  allowedFeatures?: string[];
  requiredFeatures?: string[];
  maxConcurrentUsers?: number;
  allowedDomains?: string[];
  allowedIPs?: string[];
}

export interface CreateLicenseRequest {
  appId: string;
  userEmail: string;
  userName?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  features?: string[];
}

export interface UpdateLicenseRequest {
  status?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  features?: string[];
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
  webhookUrl?: string;
  allowedOrigins?: string[];
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  webhookUrl?: string;
  allowedOrigins?: string[];
}

export interface CreateWebhookRequest {
  appId: string;
  url: string;
  events: string[];
  secret?: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  secret?: string;
  status?: string;
}

export interface ListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

export interface LicenseListOptions extends ListOptions {
  appId?: string;
  status?: string;
  userId?: string;
  userEmail?: string;
}

export interface ApplicationListOptions extends ListOptions {
  status?: string;
}

export interface WebhookListOptions extends ListOptions {
  appId?: string;
  status?: string;
}

export interface AnalyticsOptions {
  appId?: string;
  startDate?: string;
  endDate?: string;
  metric?: string;
  period?: string;
}

export interface UsageStatsOptions {
  appId?: string;
  period?: string;
  granularity?: 'day' | 'week' | 'month';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage?: number;
  previousPage?: number;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface ClientInfo {
  version: string;
  userAgent: string;
  platform?: string;
  language?: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  event?: WebhookEvent;
  error?: string;
}

export interface LicenseValidationContext {
  licenseKey: string;
  appId?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}
