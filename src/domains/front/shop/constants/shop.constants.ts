// src/domains/front/shop/constants/shop.constants.ts

export const SHOP_CONSTANTS = {
  ORDER_BY: {
    RATING: 'Rating',
    RANK: 'Rank',
    OLDEST: 'Oldest',
  } as const,

  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,

  CACHE_TIMES: {
    SHOP_DETAILS: 300, // 5 minutes
    BEST_SHOPS: 600, // 10 minutes
    SHOP_CARDS: 60, // 1 minute
    PERFORMANCE: 300, // 5 minutes
  } as const,

  BADGE: {
    VERIFIED: {
      text: 'تایید شده',
      color: 'success' as const,
    },
    PENDING: {
      text: 'در انتظار تایید',
      color: 'warning' as const,
    },
  } as const,
} as const;