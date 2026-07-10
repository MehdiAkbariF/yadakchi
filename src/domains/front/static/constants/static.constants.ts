// src/domains/front/static/constants/static.constants.ts

export const STATIC_CONSTANTS = {
  PAGE_NAMES: {
    MEGA_MENU: 'MegaMenu',
    FRONT_FOOTER: 'FrontFooter',
    USER_FAQ: 'UserFAQ',
    HOME: 'Home',
    PRODUCT_DETAIL: 'ProductDetail',
    PART_CATEGORY: 'PartCategory',
    PART: 'Part',
    SHOP: 'Shop',
    SEARCH_RESULT: 'SearchResult',
    BEST_SHOPS: 'BestShops',
    CONTACT_US: 'ContactUs',
    ABOUT_US: 'AboutUs',
    CAR: 'Car',
    SELLER_DASHBOARD: 'SellerDashboard',
    SELLER_FAQ: 'SellerFAQ',
  } as const,

  CACHE_TIMES: {
    STATIC_PAGE: 900, // 15 minutes
    CATEGORIES: 900, // 15 minutes
    FAQ: 600, // 10 minutes
    CONTACT_SUBJECTS: 600, // 10 minutes
    TOOL_TIP: 900, // 15 minutes
    MARKET_MESSAGE: 600, // 10 minutes
    CURRENT_TIME: 60, // 1 minute
  } as const,

  CONTACT_US: {
    MAX_ATTACHMENTS: 5,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  } as const,
} as const;