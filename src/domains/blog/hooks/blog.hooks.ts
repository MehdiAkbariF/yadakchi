// src/domains/blog/hooks/blog.hooks.ts

'use client';

import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getBlogService } from '../services/blog.service';
import { BlogFiltersRequest } from '../types/view.types';

const blogService = getBlogService();

export function useGetBlogCategories() {
  return useTypedQuery(
    ['blog', 'categories'],
    () => blogService.getCategories(),
    {
      staleTime: 30 * 60 * 1000,
    }
  );
}

export function useGetBlogPostFilters(params?: { blogCategoryId?: string; carTypeIds?: string[]; partIds?: string[] }) {
  return useTypedQuery(
    ['blog', 'filters', params],
    () => blogService.getFilters(params),
    {
      staleTime: 15 * 60 * 1000,
    }
  );
}

export function useGetBlogPosts(filters: BlogFiltersRequest) {
  return useTypedQuery(
    ['blog', 'posts', filters],
    () => blogService.getPosts(filters),
    {
      staleTime: 5 * 60 * 1000,
      placeholderData: (previousData) => previousData,
    }
  );
}

export function useGetBlogPostDetail(englishTitle: string) {
  return useTypedQuery(
    ['blog', 'post', englishTitle],
    () => blogService.getPostDetail(englishTitle),
    {
      staleTime: 10 * 60 * 1000,
      enabled: !!englishTitle,
    }
  );
}

export function useGetBlogPostComments(blogPostId: string, pageNumber: number = 1) {
  return useTypedQuery(
    ['blog', 'comments', blogPostId, pageNumber],
    () => blogService.getComments(blogPostId, pageNumber),
    {
      staleTime: 60 * 1000,
      enabled: !!blogPostId,
    }
  );
}