// src/domains/blog/types/view.types.ts

import { BlogCategory, BlogPostItem, BlogPostDetail } from './domain.types';

export type BlogCategoryViewModel = BlogCategory;
export type BlogPostItemViewModel = BlogPostItem;
export type BlogPostDetailViewModel = BlogPostDetail;

export interface BlogFiltersRequest {
  title?: string;
  blogCategoryId?: string;
  carTypeIds?: string[];
  partIds?: string[];
  creatorId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface BlogPostFiltersAvailable {
  carTypes: Array<{ id: string; name: string }>;
  parts: Array<{ id: string; name: string; englishTitle: string | null }>;
}