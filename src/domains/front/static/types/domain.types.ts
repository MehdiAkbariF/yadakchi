// src/domains/front/static/types/domain.types.ts

export interface StaticPage {
  id: string;
  title: string;
  englishTitle: string;
  url: string;
  content: string;
  seo: StaticPageSEO | null;
}

export interface StaticPageSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  order: number;
  isActive: boolean;
}

export interface FAQCategory {
  id: string;
  name: string;
}

export interface ContactUsSubject {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export interface ToolTip {
  id: string;
  key: string;
  title: string;
  content: string;
  isActive: boolean;
}

export interface MarketMessage {
  id: string;
  pageUrl: string;
  pageName: string;
  message: string;
}