// src/domains/front/reference/car/constants/car.constants.ts

export const CAR_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,
  
  CACHE_TIMES: {
    LIST: 600, // 10 minutes
    NAMES: 600, // 10 minutes
    PAGE: 600, // 10 minutes
    MANUFACTURERS: 900, // 15 minutes
  } as const,
} as const;