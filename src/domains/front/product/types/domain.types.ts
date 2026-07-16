export interface ProductName {
  value: string;
  english: string;
}

export interface Money {
  amount: number;
  currency: 'IRR' | 'USD' | 'EUR';
}

export interface Discount {
  percent: number;
  expirationDate: Date | null;
  originalPrice: Money;
}

export interface Image {
  url: string;
  alt: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  englishTitle: string;
}

export interface Brand {
  id: string;
  name: string;
  englishTitle: string;
  logo: string | null;
}

export interface Shop {
  id: string;
  name: string;
  rating: number;
}

export interface Inventory {
  isInStock: boolean;
  count: number;
}

export type ProductType = 'NEW' | 'STOCK' | 'TAKEOFF';

export interface ProductMetadata {
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  average: number;
  count: number;
}

export interface ProductStatistics {
  views: number;
  commentCount: number;
  inquiryCount: number;
}

export interface Product {
  id: string;
  shopProductId?: string;
  code: number;
  name: ProductName;
  description: string;
  price: Money;
  discount: Discount | null;
  images: Image[];
  category: Category;
  brand: Brand;
  shop: Shop;
  inventory: Inventory;
  type: ProductType;
  metadata: ProductMetadata;
  rating: Rating;
  statistics: ProductStatistics;
  isFavorite: boolean;
}

export interface Car {
  id: string;
  manufacturerId: string;
  model: string;
  englishTitle: string;
  cover: string | null;
}

export interface ProductSpec {
  name: string;
  value: string;
  isMain: boolean;
}

export interface ProductSpecGroup {
  name: string;
  specs: ProductSpec[];
}

export interface SeoInfo {
  title: string;
  description: string;
  canonicalUrl: string;
}

export interface BreadCrumb {
  id: string;
  title: string;
  englishTitle: string;
}

export interface ProductDetails {
  id: string;
  code: number;
  title: string;
  image: string;
  imageAlt: string;
  description: string;
  partNumber: string | null;
  averageRate: number;
  rateCount: number;
  views: number;
  salesCount: number;
  dimensions: {
    height: number;
    width: number;
    length: number;
    weight: number;
  };
  brand: Brand;
  cars: Car[];
  gallery: string[];
  videos: string[];
  specGroups: ProductSpecGroup[];
  seo: SeoInfo;
  breadCrumbs: BreadCrumb[];
}

export interface ShopDetails {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  address: string;
  plaque: string;
  unit: string;
  phone: string | null;
  averageRate: number;
  logo: string | null;
}

export interface Warranty {
  id: string;
  title: string;
  description: string;
}

export interface ShopProduct {
  id: string;
  quantity: number;
  retailPrice: number;
  finalPrice: number;
  discountPercentage: number;
  discountUntil: string | null;
  type: 'New' | 'Stock' | 'TakeOff';
  isAdvertised: boolean;
  isLocalSale: boolean;
  isTipaxShipping: boolean;
  isDirectShipping: boolean;
  dayOfDelivery: number;
  shop: ShopDetails;
  warranty: Warranty;
}

export interface ShopProductsGroup {
  newNominated: ShopProduct | null;
  newOnline: ShopProduct[];
  newLocal: ShopProduct[];
  takeOffNominated: ShopProduct | null;
  takeOffOnline: ShopProduct[];
  takeOffLocal: ShopProduct[];
  stockNominated: ShopProduct | null;
  stockOnline: ShopProduct[];
  stockLocal: ShopProduct[];
}

export interface ProductPageData {
  product: ProductDetails;
  shopProducts: ShopProductsGroup;
}

export interface PriceChart {
  dates: string[];
  prices: number[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface CommentsAverage {
  averageRate: number;
  allRatesCount: number;
  allCommentsCount: number;
  allInquiriesCount: number;
  distribution: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
}

export interface CommentItem {
  id: string;
  comment: string;
  rate: number;
  creator: string;
  likes: number;
  dislikes: number;
  repliesCount: number;
  createDate: string;
  isSellerComment: boolean;
  isBuyerUser: boolean;
  isYourComment: boolean;
  userBoughtFrom: string | null;
  userLiked: boolean;
  userDisLiked: boolean;
}

export interface InquiryItem {
  id: string;
  comment: string;
  creator: string;
  replyCount: number;
  likes: number;
  dislikes: number;
  isSellerComment: boolean;
  isBuyerUser: boolean;
  isYourComment: boolean;
  createDate: string;
  userLiked: boolean;
  userDisLiked: boolean;
  bestReply: InquiryItem | null;
}