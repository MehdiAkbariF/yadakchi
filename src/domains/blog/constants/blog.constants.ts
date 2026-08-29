// src/domains/blog/constants/blog.constants.ts

export const BLOG_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 12,
  CACHE_TIMES: {
    POSTS: 60 * 5, // 5 minutes
    CATEGORIES: 60 * 30, // 30 minutes
    DETAIL: 60 * 10, // 10 minutes
    FILTERS: 60 * 15, // 15 minutes
  },
} as const;