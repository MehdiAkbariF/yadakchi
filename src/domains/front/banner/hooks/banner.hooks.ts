// src/domains/front/banner/hooks/banner.hooks.ts

import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getBannerService } from '../services/banner.service';
import { BannerPageName } from '../endpoints/banner.endpoints';
import { BannerClickRequest, BannerViewRequest } from '../types/view.types';
import { 
  BannerViewModel, 

} from '../types/view.types';

const bannerService = getBannerService();

export function useGetBanners(
  pageName: BannerPageName,
  options?: Omit<UseQueryOptions<BannerViewModel[]>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'banners', pageName],
    () => bannerService.getBanners(pageName),
    {
      staleTime: 10 * 60 * 1000,
      ...options,
    }
  );
}

export function useGetShopProductBanners(params: {
  partCategoryId?: string;
  partId?: string;
  carId?: string;
}) {
  return useTypedQuery(
    ['front', 'banners', 'shop-product', params],
    () => bannerService.getShopProductBanners(params),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useGetMegaMenu() {
  return useTypedQuery(
    ['front', 'mega-menu'],
    () => bannerService.getMegaMenu(),
    {
      staleTime: 15 * 60 * 1000,
    }
  );
}

export function useGetFrontFooter() {
  return useTypedQuery(
    ['front', 'footer'],
    () => bannerService.getFrontFooter(),
    {
      staleTime: 15 * 60 * 1000,
    }
  );
}

export function useTrackBannerClick() {
  return useTypedMutation(
    (request: BannerClickRequest) => bannerService.trackBannerClick(request)
  );
}

export function useTrackBannerView() {
  return useTypedMutation(
    (request: BannerViewRequest) => bannerService.trackBannerView(request)
  );
}