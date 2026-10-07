// src/domains/front/static/types/dto.types.ts

// ============================================
// Static Page
// ساختار واقعی پاسخ API: /api/Front/StaticPage?Title=...
// ============================================
export interface StaticPageSeoApiDto {
  id: string;
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
}

export interface StaticPageApiDto {
  id: string;
  title: string;
  englishTitle: string;
  url: string;
  content: string;
  seoInformation: StaticPageSeoApiDto | null;
}

// ============================================
// Static Page Category
// ساختار واقعی پاسخ API: /api/Front/StaticPageCategory
// ============================================
export interface StaticPageItemApiDto {
  id: string;
  title: string;
  englishTitle: string;
  url: string;
}

export interface StaticPageCategoryApiDto {
  title: string;
  staticPages: StaticPageItemApiDto[];
}

// ============================================
// FAQ
// ============================================
export interface FAQApiDto {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  categoryName: string;
  order: number;
  isActive: boolean;
}

// ============================================
// Contact Us
// ============================================
export interface ContactUsSubjectApiDto {
  id: string;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface ContactUsRequestDto {
  subjectId: string;
  fullname: string;
  description: string;
  phoneNumber: string;
  email?: string;
  attachments?: string[];
}

// ============================================
// ToolTip
// ============================================
export interface ToolTipApiDto {
  id: string;
  key: string;
  title: string;
  content: string;
  isActive: boolean;
}

// ============================================
// Market Message
// ============================================
export interface MarketMessageApiDto {
  id: string;
  pageUrl: string;
  pageName: string;
  message: string;
  isActive: boolean;
}

// ============================================
// Newsletter
// ============================================
export interface NewsletterRequestDto {
  email: string;
}