// src/core/config/constants.ts

export const constants = {
  // HTTP Status Codes
  httpStatus: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    RATE_LIMIT: 429,
    SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  } as const,
  
  // Timeouts
  timeout: {
    SHORT: 5000,
    MEDIUM: 15000,
    LONG: 30000,
    EXTRA_LONG: 60000,
  } as const,
  
  // Cache Times
  cacheTime: {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 900,
    EXTRA_LONG: 3600,
  } as const,
  
  // Pagination
  pagination: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 30,
    MAX_PAGE_SIZE: 100,
  } as const,
  
  // Retry
  retry: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000,
    MAX_DELAY: 10000,
  } as const,
  
  // Auth
  auth: {
    SESSION_COOKIE: 'session',
    REFRESH_COOKIE: 'refresh',
  } as const,
  
  // Regex Patterns
  patterns: {
    PHONE_NUMBER: /^09[0-9]{9}$/,
    NATIONAL_CODE: /^[0-9]{10}$/,
    POSTAL_CODE: /^[0-9]{10}$/,
    EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    BANK_CARD: /^[0-9]{16}$/,
    SHEBA: /^IR[0-9]{22}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
  } as const,
} as const;