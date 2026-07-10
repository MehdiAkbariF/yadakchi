// src/domains/front/inquiry/constants/inquiry.constants.ts

export const INQUIRY_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,
  
  ORDER_BY: {
    LATEST: 'Latest',
    OLDEST: 'Oldest',
    MOST_POPULAR: 'MostPopular',
    MOST_REPLIED: 'MostReplied',
    LEAST_REPLIED: 'LeastReplied',
  } as const,
  
  CACHE_TIMES: {
    LIST: 60, // 1 minute
    REPLIES: 60, // 1 minute
    USER: 30, // 30 seconds
  } as const,
} as const;