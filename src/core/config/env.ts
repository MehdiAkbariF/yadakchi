// src/core/config/env.ts

export const env = {
  // API Configuration - در صورت خالی بودن از مسیرهای نسبی استفاده می‌شود
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Features
  enableLogging: process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',
  enableDevTools: process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true',
  
  // App Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Yadakchi Marketplace',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Pagination Defaults
  defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '30', 10),
  maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100', 10),
} as const;