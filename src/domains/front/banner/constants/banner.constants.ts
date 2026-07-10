// src/domains/front/banner/constants/banner.constants.ts

export const BANNER_CONSTANTS = {
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
    BANNERS: 600, // 10 minutes
    SHOP_PRODUCT_BANNERS: 300, // 5 minutes
    MEGA_MENU: 900, // 15 minutes
    FOOTER: 900, // 15 minutes
  } as const,
} as const;