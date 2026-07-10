// src/domains/front/static/types/dto.types.ts

export interface StaticPageApiDto {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  categoryName: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaticPageCategoryApiDto {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface FAQApiDto {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  categoryName: string;
  order: number;
  isActive: boolean;
}

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

export interface ToolTipApiDto {
  id: string;
  key: string;
  title: string;
  content: string;
  isActive: boolean;
}

export interface MarketMessageApiDto {
  id: string;
  pageUrl: string;
  pageName: string;
  message: string;
  isActive: boolean;
}

export interface NewsletterRequestDto {
  email: string;
}