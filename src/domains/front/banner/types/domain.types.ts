// src/domains/front/banner/types/domain.types.ts

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  target: '_blank' | '_self';
  position: number;
  isActive: boolean;
  pageName: string;
  schedule: BannerSchedule;
  metadata: BannerMetadata;
}

export interface BannerSchedule {
  startDate?: Date;
  endDate?: Date;
}

export interface BannerMetadata {
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopProductBanner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  product: ShopProductInfo;
  position: number;
  isActive: boolean;
}

export interface ShopProductInfo {
  id: string;
  name: string;
  code: number;
  shopName: string;
  price: number;
  discountPrice?: number;
  hasDiscount: boolean;
}

export interface MegaMenuItem {
  id: string;
  title: string;
  link: string;
  icon?: string;
  order: number;
  children: MegaMenuItem[];
  isActive: boolean;
}

export interface FrontFooter {
  id: string;
  title: string;
  description: string;
  links: FooterLink[];
  socialMedia: SocialMedia[];
  contactInfo: ContactInfo[];
}

export interface FooterLink {
  id: string;
  title: string;
  link: string;
  order: number;
}

export interface SocialMedia {
  id: string;
  name: string;
  icon: string;
  link: string;
  order: number;
}

export interface ContactInfo {
  id: string;
  type: 'phone' | 'email' | 'address' | 'working_hours';
  value: string;
  order: number;
}