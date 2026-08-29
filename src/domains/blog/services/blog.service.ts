// src/domains/blog/services/blog.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { BLOG_ENDPOINTS } from '../endpoints/blog.endpoints';
import { BlogMapper } from '../mappers/blog.mapper';
import { 
  BlogCategoryDto, 
  BlogPostFiltersResponseDto, 
  BlogPostsResponseDto, 
  BlogPostDetailDto,
  BlogPostCommentsResponseDto
} from '../types/dto.types';
import { 
  BlogCategoryViewModel, 
  BlogPostItemViewModel, 
  BlogPostDetailViewModel, 
  BlogFiltersRequest,
  BlogPostFiltersAvailable 
} from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class BlogService {
  private readonly httpClient = getHttpClient();

  async getCategories(): Promise<BlogCategoryViewModel[]> {
    try {
      const response = await this.httpClient.get<BlogCategoryDto[]>(
        BLOG_ENDPOINTS.GET_CATEGORIES
      );
      const data = Array.isArray(response.data) ? response.data : [];
      return data.map(dto => BlogMapper.toDomainCategory(dto));
    } catch (error) {
      logger.error('[BlogService] Get categories failed:', error);
      return [];
    }
  }

  async getFilters(params?: { blogCategoryId?: string; carTypeIds?: string[]; partIds?: string[] }): Promise<BlogPostFiltersAvailable> {
    try {
      const response = await this.httpClient.get<BlogPostFiltersResponseDto>(
        BLOG_ENDPOINTS.GET_FILTERS,
        {
          params: {
            BlogCategoryId: params?.blogCategoryId || undefined,
            CarTypeIds: params?.carTypeIds?.length ? params.carTypeIds : undefined,
            PartIds: params?.partIds?.length ? params.partIds : undefined,
          }
        }
      );
      return {
        carTypes: response.data?.carTypes || [],
        parts: response.data?.parts || [],
      };
    } catch (error) {
      logger.error('[BlogService] Get filters failed:', error);
      return { carTypes: [], parts: [] };
    }
  }

  async getPosts(filters: BlogFiltersRequest): Promise<PaginatedResult<BlogPostItemViewModel>> {
    try {
      const response = await this.httpClient.get<BlogPostsResponseDto>(
        BLOG_ENDPOINTS.GET_POSTS,
        {
          params: {
            Title: filters.title || undefined,
            BlogCategoryId: filters.blogCategoryId || undefined,
            CarTypeIds: filters.carTypeIds?.length ? filters.carTypeIds : undefined,
            PartIds: filters.partIds?.length ? filters.partIds : undefined,
            CreatorId: filters.creatorId || undefined,
            PageNumber: filters.pageNumber || 1,
            PageSize: filters.pageSize || 12,
          }
        }
      );

      const items = (response.data?.items || []).map(dto => BlogMapper.toDomainPostItem(dto));

      return {
        items,
        pageNumber: response.data.currentPage || 1,
        pageSize: response.data.pageSize || 12,
        totalCount: response.data.totalCount || 0,
        totalPages: response.data.totalPages || 1,
        hasNextPage: (response.data.currentPage || 1) < (response.data.totalPages || 1),
        hasPreviousPage: (response.data.currentPage || 1) > 1,
        hasMore: (response.data.currentPage || 1) < (response.data.totalPages || 1),
        from: ((response.data.currentPage || 1) - 1) * (response.data.pageSize || 12) + 1,
        to: Math.min((response.data.currentPage || 1) * (response.data.pageSize || 12), response.data.totalCount || 0),
      };
    } catch (error) {
      logger.error('[BlogService] Get posts failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getPostDetail(englishTitle: string): Promise<BlogPostDetailViewModel> {
    try {
      const response = await this.httpClient.get<BlogPostDetailDto>(
        BLOG_ENDPOINTS.GET_POST_DETAIL,
        { params: { EnglishTitle: englishTitle } }
      );

      return BlogMapper.toDomainPostDetail(response.data);
    } catch (error) {
      logger.error('[BlogService] Get post detail failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getComments(blogPostId: string, pageNumber: number = 1, pageSize: number = 30): Promise<PaginatedResult<any>> {
    try {
      const response = await this.httpClient.get<BlogPostCommentsResponseDto>(
        BLOG_ENDPOINTS.GET_COMMENTS,
        {
          params: {
            BlogPostId: blogPostId,
            PageNumber: pageNumber,
            PageSize: pageSize,
          }
        }
      );

      return {
        items: response.data?.items || [],
        pageNumber: response.data?.currentPage || 1,
        pageSize: response.data?.pageSize || pageSize,
        totalCount: response.data?.totalCount || 0,
        totalPages: response.data?.totalPages || 1,
        hasNextPage: (response.data?.currentPage || 1) < (response.data?.totalPages || 1),
        hasPreviousPage: (response.data?.currentPage || 1) > 1,
        hasMore: (response.data?.currentPage || 1) < (response.data?.totalPages || 1),
        from: ((response.data?.currentPage || 1) - 1) * pageSize + 1,
        to: Math.min((response.data?.currentPage || 1) * pageSize, response.data?.totalCount || 0),
      };
    } catch (error) {
      logger.error('[BlogService] Get comments failed:', error);
      return {
        items: [],
        pageNumber: 1,
        pageSize,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        hasMore: false,
        from: 1,
        to: 0,
      };
    }
  }
}

let blogServiceInstance: BlogService | null = null;

export function getBlogService(): BlogService {
  if (!blogServiceInstance) {
    blogServiceInstance = new BlogService();
  }
  return blogServiceInstance;
}