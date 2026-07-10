// src/domains/front/inquiry/endpoints/inquiry.endpoints.ts

export const INQUIRY_ENDPOINTS = {
  GET_PRODUCT_INQUIRIES: '/api/Front/ProductInquiries',
  GET_INQUIRY_REPLIES: '/api/Front/ProductInquiryReplies',
  
  // User Panel
  GET_USER_INQUIRIES: '/api/UserPanel/GetUserInquiries',
  POST_INQUIRY: '/api/UserPanel/ProductInquiry',
  DELETE_INQUIRY: '/api/UserPanel/ProductInquiry',
  POST_INQUIRY_LIKE: '/api/UserPanel/ProductInquiryLike',
  DELETE_INQUIRY_LIKE: '/api/UserPanel/ProductInquiryLike',
} as const;