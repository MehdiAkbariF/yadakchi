// src/domains/front/part/constants/part.constants.ts

export const PART_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,
  
  CACHE_TIMES: {
    LIST: 60, // 1 minute
    PAGE: 300, // 5 minutes
    PROPERTIES: 300, // 5 minutes
    CATEGORIES: 600, // 10 minutes
    CATEGORY_PAGE: 300, // 5 minutes
    NAMES: 60, // 1 minute
  } as const,
} as const;