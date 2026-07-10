// src/domains/front/banner/endpoints/banner.endpoints.ts

export const BANNER_ENDPOINTS = {
  GET_BANNERS: '/api/Front/Banners',
  GET_SHOP_PRODUCT_BANNERS: '/api/Front/ShopProductBanners',
  POST_BANNER_CLICK: '/api/Front/BannerClick',
  POST_BANNER_VIEW: '/api/Front/BannerView',
  GET_MEGA_MENU: '/api/Front/GetMegaMenu',
  GET_FRONT_FOOTER: '/api/Front/GetFrontFooter',
} as const;

export type BannerPageName = 
  | 'MegaMenu'
  | 'FrontFooter'
  | 'UserFAQ'
  | 'Home'
  | 'ProductDetail'
  | 'PartCategory'
  | 'Part'
  | 'Shop'
  | 'SearchResult'
  | 'BestShops'
  | 'ContactUs'
  | 'AboutUs'
  | 'Car'
  | 'SellerDashboard'
  | 'SellerFAQ';