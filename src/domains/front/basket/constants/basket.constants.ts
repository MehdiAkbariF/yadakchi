// src/domains/front/basket/constants/basket.constants.ts

export const BASKET_CONSTANTS = {
  MAX_QUANTITY: 100,
  MIN_QUANTITY: 1,
  
  CACHE_TIME: 30, // 30 seconds
  
  TYPES: {
    NEW: 'NEW',
    STOCK: 'STOCK',
    TAKEOFF: 'TAKEOFF',
  } as const,
  
  TYPE_LABELS: {
    NEW: 'جدید',
    STOCK: 'موجود',
    TAKEOFF: 'حراج',
  } as const,
  
  TYPE_BADGES: {
    NEW: 'success' as const,
    STOCK: 'info' as const,
    TAKEOFF: 'warning' as const,
  } as const,
} as const;