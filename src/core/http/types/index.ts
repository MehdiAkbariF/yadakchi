// src/core/http/types/index.ts

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  retry?: RetryOptions;
}

export interface RetryOptions {
  maxRetries: number;
  delay: number;
  shouldRetry?: (error: unknown) => boolean;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HttpRequest;
  duration: number;
}

export interface HttpRequest {
  url: string;
  method: HttpMethod;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface PaginatedRequest extends RequestOptions {
  pageNumber?: number;
  pageSize?: number;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  timestamp?: string;
  path?: string;
}