// src/domains/front/comment/services/comment.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { COMMENT_ENDPOINTS } from '../endpoints/comment.endpoints';
import { CommentMapper } from '../mappers/comment.mapper';
import { CommentFilters, CreateCommentRequest, UpdateCommentRequest, LikeCommentRequest } from '../types/view.types';
import { CommentApiDto, CommentReplyApiDto, CommentAverageApiDto } from '../types/dto.types';
import { CommentViewModel, CommentAverageViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class CommentService {
  private readonly httpClient = getHttpClient();

  async getProductComments(filters: CommentFilters): Promise<PaginatedResult<CommentViewModel>> {
    try {
      const params: Record<string, unknown> = {
        ProductId: filters.productId,
        OrderBy: filters.orderBy || 'Newest',
        PageNumber: filters.pageNumber || 1,
        PageSize: filters.pageSize || 30,
      };

      const response = await this.httpClient.get<{
        items: CommentApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(COMMENT_ENDPOINTS.GET_PRODUCT_COMMENTS, { params });

      const items = response.data.items.map(dto => {
        const domain = CommentMapper.toDomain(dto);
        return CommentMapper.toView(domain);
      });

      return {
        items,
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        hasMore: response.data.hasNextPage,
        from: (response.data.pageNumber - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.pageNumber * response.data.pageSize, response.data.totalCount),
      };
    } catch (error) {
      logger.error('[CommentService] Get product comments failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getCommentReplies(commentId: string, pageNumber: number = 1, pageSize: number = 30): Promise<PaginatedResult<CommentViewModel>> {
    try {
      const response = await this.httpClient.get<{
        items: CommentReplyApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(COMMENT_ENDPOINTS.GET_COMMENT_REPLIES, {
        params: { CommentId: commentId, PageNumber: pageNumber, PageSize: pageSize }
      });

      // تبدیل Reply به Comment
      const items = response.data.items.map(dto => {
        const domain = {
          ...dto,
          productId: '',
          rate: 0,
          replyCount: 0,
          parentId: commentId,
        } as CommentApiDto;
        const commentDomain = CommentMapper.toDomain(domain);
        return CommentMapper.toView(commentDomain);
      });

      return {
        items,
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        hasMore: response.data.hasNextPage,
        from: (response.data.pageNumber - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.pageNumber * response.data.pageSize, response.data.totalCount),
      };
    } catch (error) {
      logger.error('[CommentService] Get comment replies failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getCommentAverage(productId: string): Promise<CommentAverageViewModel> {
    try {
      const response = await this.httpClient.get<CommentAverageApiDto>(
        COMMENT_ENDPOINTS.GET_COMMENT_AVERAGE,
        { params: { Id: productId } }
      );
      return CommentMapper.toViewAverage(response.data);
    } catch (error) {
      logger.error('[CommentService] Get comment average failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async createComment(request: CreateCommentRequest): Promise<CommentViewModel> {
    try {
      const dto = CommentMapper.toCreateRequest(request);
      const response = await this.httpClient.post<CommentApiDto>(
        COMMENT_ENDPOINTS.POST_COMMENT,
        dto
      );
      const domain = CommentMapper.toDomain(response.data);
      return CommentMapper.toView(domain);
    } catch (error) {
      logger.error('[CommentService] Create comment failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async updateComment(request: UpdateCommentRequest): Promise<CommentViewModel> {
    try {
      const dto = CommentMapper.toUpdateRequest(request);
      const response = await this.httpClient.put<CommentApiDto>(
        COMMENT_ENDPOINTS.PUT_COMMENT,
        dto
      );
      const domain = CommentMapper.toDomain(response.data);
      return CommentMapper.toView(domain);
    } catch (error) {
      logger.error('[CommentService] Update comment failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      await this.httpClient.delete(COMMENT_ENDPOINTS.DELETE_COMMENT, {
        params: { id: commentId }
      });
    } catch (error) {
      logger.error('[CommentService] Delete comment failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async likeComment(request: LikeCommentRequest): Promise<void> {
    try {
      const dto = CommentMapper.toLikeRequest(request);
      await this.httpClient.post(COMMENT_ENDPOINTS.POST_COMMENT_LIKE, dto);
    } catch (error) {
      logger.error('[CommentService] Like comment failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async unlikeComment(likeId: string): Promise<void> {
    try {
      await this.httpClient.delete(COMMENT_ENDPOINTS.DELETE_COMMENT_LIKE, {
        params: { id: likeId }
      });
    } catch (error) {
      logger.error('[CommentService] Unlike comment failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getPendingComments(pageNumber: number = 1, pageSize: number = 30): Promise<PaginatedResult<CommentViewModel>> {
    try {
      const response = await this.httpClient.get<{
        items: CommentApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(COMMENT_ENDPOINTS.GET_PENDING_COMMENTS, {
        params: { PageNumber: pageNumber, PageSize: pageSize }
      });

      const items = response.data.items.map(dto => {
        const domain = CommentMapper.toDomain(dto);
        return CommentMapper.toView(domain);
      });

      return {
        items,
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        hasMore: response.data.hasNextPage,
        from: (response.data.pageNumber - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.pageNumber * response.data.pageSize, response.data.totalCount),
      };
    } catch (error) {
      logger.error('[CommentService] Get pending comments failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getUserComments(pageNumber: number = 1, pageSize: number = 30): Promise<PaginatedResult<CommentViewModel>> {
    try {
      const response = await this.httpClient.get<{
        items: CommentApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(COMMENT_ENDPOINTS.GET_USER_COMMENTS, {
        params: { PageNumber: pageNumber, PageSize: pageSize }
      });

      const items = response.data.items.map(dto => {
        const domain = CommentMapper.toDomain(dto);
        return CommentMapper.toView(domain);
      });

      return {
        items,
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        hasMore: response.data.hasNextPage,
        from: (response.data.pageNumber - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.pageNumber * response.data.pageSize, response.data.totalCount),
      };
    } catch (error) {
      logger.error('[CommentService] Get user comments failed:', error);
      throw errorManager.normalize(error);
    }
  }
}

let commentServiceInstance: CommentService | null = null;

export function getCommentService(): CommentService {
  if (!commentServiceInstance) {
    commentServiceInstance = new CommentService();
  }
  return commentServiceInstance;
}