// src/domains/front/static/types/view.types.ts

// ============================================
// Static Page
// ============================================
export interface StaticPageViewModel {
  id: string;
  title: string;
  englishTitle: string;
  url: string;
  content: string;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    canonicalUrl: string | null;
  } | null;
}

// ============================================
// Static Page Item (برای فوتر)
// ============================================
export interface StaticPageItemViewModel {
  id: string;
  title: string;
  englishTitle: string;
  url: string;
}

// ============================================
// Static Page Category (برای فوتر)
// ============================================
export interface StaticPageCategoryViewModel {
  title: string;
  staticPages: StaticPageItemViewModel[];
}

// ============================================
// FAQ
// ============================================
export interface FAQViewModel {
  id: string;
  question: string;
  answer: string;
  category: {
    id: string;
    name: string;
  };
  order: number;
}

// ============================================
// Contact Us
// ============================================
export interface ContactUsSubjectViewModel {
  id: string;
  title: string;
  description: string | null;
  order: number;
}

export interface ContactUsRequest {
  subjectId: string;
  fullname: string;
  description: string;
  phoneNumber: string;
  email?: string;
  attachments?: File[];
}

// ============================================
// ToolTip
// ============================================
export interface ToolTipViewModel {
  id: string;
  key: string;
  title: string;
  content: string;
}

// ============================================
// Market Message
// ============================================
export interface MarketMessageViewModel {
  id: string;
  pageUrl: string;
  pageName: string;
  message: string;
}

// ============================================
// Newsletter
// ============================================
export interface NewsletterRequest {
  email: string;
}

// ============================================
// Filters
// ============================================
export interface StaticPageFilters {
  title?: string;
  categoryId?: string;
}

export interface FAQFilters {
  categoryId?: string;
  qorA?: string;
}