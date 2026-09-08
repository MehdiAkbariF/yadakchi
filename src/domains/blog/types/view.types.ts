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

export interface BlogPostCommentViewModel {
  id: string;
  blogPostId: string;
  comment: string;
  creatorName: string;
  createDateFormatted: string;
  isIncognito: boolean;
  likes: number;
  dislikes: number;
}

export interface CreateBlogPostCommentRequest {
  blogPostId: string;
  comment: string;
  isIncognito: boolean;
}

export interface UserBlogPostCommentViewModel {
  id: string;
  blogPostId: string;
  blogPostTitle: string;
  blogPostEnglishTitle: string;
  blogPostImage: string | null;
  comment: string;
  isConfirmed: boolean;
  isIncognito: boolean;
  createDateFormatted: string;
}