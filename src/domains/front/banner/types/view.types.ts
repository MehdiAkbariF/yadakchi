// src/domains/front/banner/types/view.types.ts

export interface BannerViewModel {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  link: string | null;
  target: '_blank' | '_self';
  position: number;
  pageName: string;
  schedule: {
    startDate: string | null;
    endDate: string | null;
  };
  isActive: boolean;
}

export interface ShopProductBannerViewModel {
  id: string;
  title: string;
  imageUrl: string;
  link: string | null;
  product: {
    id: string;
    name: string;
    code: number;
    shopName: string;
    price: {
      raw: number;
      formatted: string;
      toman: string;
    };
    discount: {
      hasDiscount: boolean;
      discountPrice: string | null;
      discountPercent: number | null;
    };
  };
  position: number;
}

export interface MegaMenuItemViewModel {
  id: string;
  title: string;
  link: string;
  icon: string | null;
  order: number;
  children: MegaMenuItemViewModel[];
}

export interface FrontFooterViewModel {
  title: string;
  description: string;
  links: Array<{
    id: string;
    title: string;
    link: string;
    order: number;
  }>;
  socialMedia: Array<{
    id: string;
    name: string;
    icon: string;
    link: string;
    order: number;
  }>;
  contactInfo: Array<{
    id: string;
    type: 'phone' | 'email' | 'address' | 'working_hours';
    value: string;
    order: number;
  }>;
}

export interface BannerClickRequest {
  bannerIds: string[];
  shopProductIds: string[];
}

export interface BannerViewRequest {
  bannerIds: string[];
  shopProductIds: string[];
}

export interface BannerFilters {
  pageName: string;
  isActive?: boolean;
}