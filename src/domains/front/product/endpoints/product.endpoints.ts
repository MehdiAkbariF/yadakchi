// src/domains/front/product/endpoints/product.endpoints.ts

export const PRODUCT_ENDPOINTS = {
  // Product endpoints - مسیرهای نسبی
  GET_PRODUCT: '/api/Front/ProductPage',
  GET_RELATED_PRODUCTS: '/api/Front/ProductRelatedProducts',
  GET_PRICE_CHART: '/api/Front/ProductPriceChart',
  IS_FAVORITE: '/api/Front/IsUserFavoriteProduct',
  
  // Search endpoints
  SEARCH_PRODUCTS: '/api/Front/SearchProducts',
  SEARCH_NOMINATED: '/api/Front/SearchNominatedProducts',
  SEARCH_KEYWORDS: '/api/Front/SearchProductKeywords',
  SEARCH_SUGGESTIONS: '/api/Front/SearchProductSuggestion',
  SEARCH_HISTORY: '/api/Front/SearchProductHistory',
  REMOVE_SEARCH_HISTORY: '/api/Front/RemoveSearchProductHistory',
} as const;