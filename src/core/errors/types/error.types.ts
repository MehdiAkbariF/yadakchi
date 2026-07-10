// src/core/errors/types/error.types.ts

export enum ErrorType {
  // Client Errors (4xx)
  BAD_REQUEST = 'bad_request',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',

  // Server Errors (5xx)
  SERVER_ERROR = 'server_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',

  // Network Errors
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  ABORTED = 'aborted',

  // Business Logic Errors
  BUSINESS = 'business',
  PERMISSION = 'permission',

  // Unknown
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
  value?: unknown;
}