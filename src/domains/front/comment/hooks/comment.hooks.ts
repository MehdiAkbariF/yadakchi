// src/domains/front/comment/hooks/comment.hooks.ts

import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getCommentService } from '../services/comment.service';
import { CommentFilters, CreateCommentRequest, UpdateCommentRequest, LikeCommentRequest } from '../types/view.types';
import { CommentViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

const commentService = getCommentService();

export function useGetProductComments(
  filters: CommentFilters,
  options?: Omit<UseQueryOptions<PaginatedResult<CommentViewModel>>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'comments', 'product', filters.productId, filters],
    () => commentService.getProductComments(filters),
    {
      placeholderData: (previousData) => previousData,
      staleTime: 60 * 1000,
      ...options,
    }
  );
}

export function useGetCommentReplies(
  commentId: string,
  pageNumber: number = 1,
  pageSize: number = 30
) {
  return useTypedQuery(
    ['front', 'comments', 'replies', commentId, pageNumber, pageSize],
    () => commentService.getCommentReplies(commentId, pageNumber, pageSize),
    {
      staleTime: 60 * 1000,
      enabled: !!commentId,
    }
  );
}

export function useGetCommentAverage(productId: string) {
  return useTypedQuery(
    ['front', 'comments', 'average', productId],
    () => commentService.getCommentAverage(productId),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!productId,
    }
  );
}

export function useCreateComment() {
  return useTypedMutation(
    (request: CreateCommentRequest) => commentService.createComment(request)
  );
}

export function useUpdateComment() {
  return useTypedMutation(
    (request: UpdateCommentRequest) => commentService.updateComment(request)
  );
}

export function useDeleteComment() {
  return useTypedMutation(
    (commentId: string) => commentService.deleteComment(commentId)
  );
}

export function useLikeComment() {
  return useTypedMutation(
    (request: LikeCommentRequest) => commentService.likeComment(request)
  );
}

export function useUnlikeComment() {
  return useTypedMutation(
    (likeId: string) => commentService.unlikeComment(likeId)
  );
}

export function useGetPendingComments(pageNumber: number = 1, pageSize: number = 30) {
  return useTypedQuery(
    ['user', 'comments', 'pending', pageNumber, pageSize],
    () => commentService.getPendingComments(pageNumber, pageSize),
    {
      staleTime: 30 * 1000,
    }
  );
}

export function useGetUserComments(pageNumber: number = 1, pageSize: number = 30) {
  return useTypedQuery(
    ['user', 'comments', 'user', pageNumber, pageSize],
    () => commentService.getUserComments(pageNumber, pageSize),
    {
      staleTime: 30 * 1000,
    }
  );
}