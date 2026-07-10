// src/domains/front/static/types/view.types.ts

export interface StaticPageViewModel {
  id: string;
  title: string;
  content: string;
  category: {
    id: string;
    name: string;
  };
  slug: string;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface StaticPageCategoryViewModel {
  id: string;
  name: string;
  description: string | null;
  order: number;
}

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

export interface ToolTipViewModel {
  id: string;
  key: string;
  title: string;
  content: string;
}

export interface MarketMessageViewModel {
  id: string;
  pageUrl: string;
  pageName: string;
  message: string;
}

export interface NewsletterRequest {
  email: string;
}

export interface StaticPageFilters {
  title?: string;
  categoryId?: string;
}

export interface FAQFilters {
  categoryId?: string;
  qorA?: string;
}