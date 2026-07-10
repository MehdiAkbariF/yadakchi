// src/domains/front/static/hooks/static.hooks.ts

import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getStaticService } from '../services/static.service';
import { 
 
  FAQFilters, 
  ContactUsRequest, 
  NewsletterRequest 
} from '../types/view.types';
import { 
  StaticPageViewModel, 
  
  FAQViewModel,

  ToolTipViewModel,
 
} from '../types/view.types';

const staticService = getStaticService();

export function useGetStaticPage(
  title: string,
  options?: Omit<UseQueryOptions<StaticPageViewModel | null>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'static-page', title],
    () => staticService.getStaticPage(title),
    {
      staleTime: 15 * 60 * 1000,
      enabled: !!title,
      ...options,
    }
  );
}

export function useGetStaticPageCategories() {
  return useTypedQuery(
    ['front', 'static-page-categories'],
    () => staticService.getStaticPageCategories(),
    {
      staleTime: 15 * 60 * 1000,
    }
  );
}

export function useGetFAQ(
  filters: FAQFilters = {},
  options?: Omit<UseQueryOptions<FAQViewModel[]>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'faq', filters],
    () => staticService.getFAQ(filters),
    {
      staleTime: 10 * 60 * 1000,
      ...options,
    }
  );
}

export function useGetContactUsSubjects() {
  return useTypedQuery(
    ['front', 'contact-us-subjects'],
    () => staticService.getContactUsSubjects(),
    {
      staleTime: 10 * 60 * 1000,
    }
  );
}

export function useSubmitContactUs() {
  return useTypedMutation(
    (request: ContactUsRequest) => staticService.submitContactUs(request)
  );
}

export function useGetToolTip(
  key: string,
  options?: Omit<UseQueryOptions<ToolTipViewModel | null>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'tool-tip', key],
    () => staticService.getToolTip(key),
    {
      staleTime: 15 * 60 * 1000,
      enabled: !!key,
      ...options,
    }
  );
}

export function useGetMarketMessage(params: {
  pageUrl?: string;
  pageName?: string;
  description?: string;
}) {
  return useTypedQuery(
    ['front', 'market-message', params],
    () => staticService.getMarketMessage(params),
    {
      staleTime: 10 * 60 * 1000,
    }
  );
}

export function useSubscribeNewsletter() {
  return useTypedMutation(
    (request: NewsletterRequest) => staticService.subscribeNewsletter(request)
  );
}

export function useGetCurrentTime() {
  return useTypedQuery(
    ['front', 'current-time'],
    () => staticService.getCurrentTime(),
    {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: true,
    }
  );
}