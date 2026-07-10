// src/domains/front/banner/types/dto.types.ts

export interface BannerApiDto {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  target?: '_blank' | '_self';
  position: number;
  isActive: boolean;
  pageName: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopProductBannerApiDto {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  shopProductId: string;
  productName: string;
  productCode: number;
  shopName: string;
  price: number;
  discountPrice?: number;
  hasDiscount: boolean;
  position: number;
  isActive: boolean;
}

export interface MegaMenuItemApiDto {
  id: string;
  title: string;
  link: string;
  icon?: string;
  order: number;
  children: MegaMenuItemApiDto[];
  isActive: boolean;
}

export interface FrontFooterApiDto {
  id: string;
  title: string;
  description: string;
  links: FooterLinkApiDto[];
  socialMedia: SocialMediaApiDto[];
  contactInfo: ContactInfoApiDto[];
}

export interface FooterLinkApiDto {
  id: string;
  title: string;
  link: string;
  order: number;
}

export interface SocialMediaApiDto {
  id: string;
  name: string;
  icon: string;
  link: string;
  order: number;
}

export interface ContactInfoApiDto {
  id: string;
  type: 'phone' | 'email' | 'address' | 'working_hours';
  value: string;
  order: number;
}

export interface BannerClickRequestDto {
  bannerIds: string[];
  shopProductIds: string[];
}

export interface BannerViewRequestDto {
  bannerIds: string[];
  shopProductIds: string[];
}