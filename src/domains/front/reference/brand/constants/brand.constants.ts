// src/domains/front/reference/brand/constants/brand.constants.ts

export const BRAND_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,
  
  CACHE_TIMES: {
    LIST: 600, // 10 minutes
    NAMES: 600, // 10 minutes
    MAIN: 900, // 15 minutes
  } as const,
} as const;