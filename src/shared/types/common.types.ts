// src/shared/types/common.types.ts

export type ID = string;
export type Timestamp = string; // ISO 8601
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiErrorDetail[];
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export type OrderDirection = 'asc' | 'desc';

export interface FilterParams {
  searchTerm?: string;
  fromDate?: Timestamp;
  toDate?: Timestamp;
  status?: string | string[];
  ids?: ID[];
}

// Pagination Result for Domain
export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  hasMore: boolean;
  from: number;
  to: number;
}