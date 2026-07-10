// src/domains/front/comment/constants/comment.constants.ts

export const COMMENT_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,
  
  ORDER_BY: {
    NEWEST: 'Newest',
    OLDEST: 'Oldest',
    MOST_LIKE: 'MostLike',
    LEAST_LIKE: 'LeastLike',
  } as const,
  
  CACHE_TIMES: {
    LIST: 60, // 1 minute
    REPLIES: 60, // 1 minute
    AVERAGE: 300, // 5 minutes
    PENDING: 30, // 30 seconds
    USER: 30, // 30 seconds
  } as const,
} as const;