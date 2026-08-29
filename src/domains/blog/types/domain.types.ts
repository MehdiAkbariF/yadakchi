// src/domains/blog/types/domain.types.ts

export interface BlogCategory {
  id: string;
  title: string;
  iconUrl: string | null;
}

export interface BlogPostItem {
  id: string;
  title: string;
  englishTitle: string;
  imageUrl: string | null;
  imageAlt: string | null;
  readTime: number;
  authorName: string;
  category: BlogCategory | null;
  carTypes: Array<{ id: string; name: string }>;
  parts: Array<{ id: string; name: string; englishTitle: string | null }>;
}

export interface BlogPostDetail {
  id: string;
  title: string;
  englishTitle: string;
  description: string;
  summary: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  readTime: number;
  author: {
    id: string | null;
    fullName: string;
    phoneNumber?: string;
  };
  category: BlogCategory | null;
  faqs: Array<{ id: string; question: string; answer: string }>;
  carTypes: Array<{ id: string; name: string }>;
  parts: Array<{ id: string; name: string; englishTitle: string | null }>;
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
  } | null;
}