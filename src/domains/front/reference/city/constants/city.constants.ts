// src/domains/front/reference/city/constants/city.constants.ts

export const CITY_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,
  
  CACHE_TIMES: {
    LIST: 900, // 15 minutes
    PROVINCE_CITIES: 600, // 10 minutes
  } as const,
} as const;