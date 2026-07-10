// src/domains/front/inquiry/hooks/inquiry.hooks.ts

import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getInquiryService } from '../services/inquiry.service';
import { InquiryFilters, CreateInquiryRequest, LikeInquiryRequest } from '../types/view.types';
import { InquiryViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

const inquiryService = getInquiryService();

export function useGetProductInquiries(
  filters: InquiryFilters,
  options?: Omit<UseQueryOptions<PaginatedResult<InquiryViewModel>>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'inquiries', 'product', filters.productId, filters],
    () => inquiryService.getProductInquiries(filters),
    {
      placeholderData: (previousData) => previousData,
      staleTime: 60 * 1000,
      ...options,
    }
  );
}

export function useGetInquiryReplies(
  inquiryId: string,
  pageNumber: number = 1,
  pageSize: number = 30
) {
  return useTypedQuery(
    ['front', 'inquiries', 'replies', inquiryId, pageNumber, pageSize],
    () => inquiryService.getInquiryReplies(inquiryId, pageNumber, pageSize),
    {
      staleTime: 60 * 1000,
      enabled: !!inquiryId,
    }
  );
}

export function useCreateInquiry() {
  return useTypedMutation(
    (request: CreateInquiryRequest) => inquiryService.createInquiry(request)
  );
}

export function useDeleteInquiry() {
  return useTypedMutation(
    (inquiryId: string) => inquiryService.deleteInquiry(inquiryId)
  );
}

export function useLikeInquiry() {
  return useTypedMutation(
    (request: LikeInquiryRequest) => inquiryService.likeInquiry(request)
  );
}

export function useUnlikeInquiry() {
  return useTypedMutation(
    (likeId: string) => inquiryService.unlikeInquiry(likeId)
  );
}

export function useGetUserInquiries(pageNumber: number = 1, pageSize: number = 30) {
  return useTypedQuery(
    ['user', 'inquiries', 'user', pageNumber, pageSize],
    () => inquiryService.getUserInquiries(pageNumber, pageSize),
    {
      staleTime: 30 * 1000,
    }
  );
}

// Export all as default for better compatibility
export default {
  useGetProductInquiries,
  useGetInquiryReplies,
  useCreateInquiry,
  useDeleteInquiry,
  useLikeInquiry,
  useUnlikeInquiry,
  useGetUserInquiries,
};