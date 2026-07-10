// src/domains/front/part/endpoints/part.endpoints.ts

export const PART_ENDPOINTS = {
  // Part endpoints
  GET_PART_LIST: '/api/Front/PartList',
  GET_PART_PAGE: '/api/Front/GetPartPage',
  GET_PART_PROPERTIES: '/api/Front/PartProperties',
  GET_PARTS_NAME: '/api/Front/PartsName',
  
  // Category endpoints
  GET_PART_CATEGORIES: '/api/Front/PartCategories',
  GET_PART_CATEGORY_PAGE: '/api/Front/PartCategoryPage',
  GET_PART_CATEGORIES_NAME: '/api/Front/PartCategoriesName',
} as const;