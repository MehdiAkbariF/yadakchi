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

// ساختار مگا منو منطبق با خروجی واقعی API شما
export interface MegaMenuPartApiDto {
  id: string;
  name: string;
  englishTitle: string;
  icon: string | null;
  iconAlt: string | null;
}

export interface MegaMenuCategoryApiDto {
  id: string;
  name: string;
  englishTitle: string;
  icon: string | null;
  parts: MegaMenuPartApiDto[];
}

export interface MegaMenuResponseApiDto {
  partCategories: MegaMenuCategoryApiDto[];
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