// src/domains/front/static/endpoints/static.endpoints.ts

export const STATIC_ENDPOINTS = {
  GET_STATIC_PAGE: '/api/Front/StaticPage',
  GET_STATIC_PAGE_CATEGORY: '/api/Front/StaticPageCategory',
  GET_FAQ: '/api/Front/FAQ',
  GET_CONTACT_US_SUBJECTS: '/api/Front/ContactUsFormSubjects',
  POST_CONTACT_US: '/api/Front/ContactUsForm',
  GET_TOOL_TIP: '/api/Front/ToolTip',
  GET_MARKET_MESSAGE: '/api/Front/MarketMessage',
  POST_NEWSLETTER: '/api/Front/NewsletterEmail',
  GET_CURRENT_TIME: '/api/Front/GetCurrentTime',
} as const;