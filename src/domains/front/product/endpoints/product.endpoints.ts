export const PRODUCT_ENDPOINTS = {
  GET_PRODUCT: '/api/Front/ProductPage',
  GET_RELATED_PRODUCTS: '/api/Front/ProductRelatedProducts',
  GET_PRICE_CHART: '/api/Front/ProductPriceChart',
  IS_FAVORITE: '/api/Front/IsUserFavoriteProduct',
  SEARCH_PRODUCTS: '/api/Search/products',   // ✅ OpenSearch جدید
  SEARCH_NOMINATED: '/api/Search/products',  // ✅ این هم به OpenSearch جدید متصل شد
  SEARCH_KEYWORDS: '/api/Front/SearchProductKeywords',
  SEARCH_SUGGESTIONS: '/api/Front/SearchProductSuggestion',
  SEARCH_HISTORY: '/api/Front/SearchProductHistory',
  REMOVE_SEARCH_HISTORY: '/api/Front/RemoveSearchProductHistory',
  GET_COMMENTS_AVERAGE: '/api/Front/ProductCommentsAverageRate',
  GET_COMMENTS: '/api/Front/ProductComments',
  GET_INQUIRIES: '/api/Front/ProductInquiries',
  POST_FAVORITE: '/api/UserPanel/ProductFavorite',
  DELETE_FAVORITE: '/api/UserPanel/ProductFavorite',
} as const;