export interface ProductViewModel {
  id: string;
  shopProductId?: string;
  code: number;
  name: string;
  englishTitle: string;
  description: string;
  price: {
    raw: number;
    formatted: string;
    toman: number;
    formattedToman: string;
  };
  discount: {
    hasDiscount: boolean;
    percent: number;
    originalPrice: string;
    discountedPrice: string;
    expirationDate: string | null;
    isActive: boolean;
  };
  images: {
    thumbnail: string;
    medium: string;
    large: string;
    alt: string;
  }[];
  category: {
    id: string;
    name: string;
    englishTitle: string;
  };
  brand: {
    id: string;
    name: string;
    englishTitle: string;
  };
  shop: {
    id: string;
    name: string;
    rating: number;
    ratingStars: number;
  };
  inventory: {
    isInStock: boolean;
    count: number;
    status: 'AVAILABLE' | 'LIMITED' | 'OUT_OF_STOCK';
    statusText: string;
  };
  type: {
    value: 'NEW' | 'STOCK' | 'TAKEOFF';
    label: string;
    badge: 'success' | 'warning' | 'info';
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    isNew: boolean;
    isRecentlyUpdated: boolean;
  };
  rating: {
    average: number;
    count: number;
    stars: number;
    percentage: number;
  };
  statistics: {
    views: number;
    viewsFormatted: string;
    commentCount: number;
    inquiryCount: number;
    popularity: 'HIGH' | 'MEDIUM' | 'LOW';
    popularityText: string;
  };
  isFavorite: boolean;
}

export interface SearchProductsRequest {
  searchTitle?: string;
  isProductInStock?: boolean;
  isSellerInUserCity?: boolean;
  types?: Array<'New' | 'Stock' | 'TakeOff'>;
  partCategoryIds?: string[];
  partCategoryEnglishTitle?: string;
  partEnglishTitle?: string;
  carModel?: string;
  carIds?: string[];
  partIds?: string[];
  brandIds?: string[];
  shopId?: string;
  cityId?: string;
  hasDiscount?: boolean;
  hasDiscountWithExpiration?: boolean;
  fromPrice?: number;
  toPrice?: number;
  orderType?: 'Selected' | 'MostVisited' | 'Newest' | 'BestSelling' | 'Cheapest' | 'MostExpensive' | 'HighestRated';
  productDetails?: string;
  productCode?: number;
  samePartByProductCode?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface ProductPriceChartViewModel {
  dates: string[];
  prices: number[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface BrandViewModel {
  id: string;
  name: string;
  englishTitle: string;
  logo: string | null;
}

export interface CarViewModel {
  id: string;
  model: string;
  englishTitle: string;
  cover: string | null;
}

export interface ProductSpecViewModel {
  name: string;
  value: string;
  isMain: boolean;
}

export interface ProductSpecGroupViewModel {
  name: string;
  specs: ProductSpecViewModel[];
}

export interface BreadCrumbViewModel {
  id: string;
  title: string;
  englishTitle: string;
  url: string;
}

export interface ProductDetailsViewModel {
  id: string;
  code: number;
  title: string;
  image: string;
  imageAlt: string;
  description: string;
  partNumber: string | null;
  averageRate: number;
  rateCount: number;
  views: string;
  salesCount: string;
  brand: BrandViewModel;
  cars: CarViewModel[];
  gallery: string[];
  specGroups: ProductSpecGroupViewModel[];
  seo: {
    title: string;
    description: string;
  };
  breadCrumbs: BreadCrumbViewModel[];
}

export interface ShopDetailsViewModel {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string | null;
  averageRate: number;
  logo: string | null;
}

export interface ShopProductViewModel {
  id: string;
  quantity: number;
  retailPrice: string;
  finalPrice: string;
  retailPriceRaw: number;
  finalPriceRaw: number;
  discountPercentage: number;
  hasDiscount: boolean;
  type: 'New' | 'Stock' | 'TakeOff';
  typeLabel: string;
  isAdvertised: boolean;
  isLocalSale: boolean;
  isTipaxShipping: boolean;
  isDirectShipping: boolean;
  dayOfDelivery: number;
  dayOfDeliveryLabel: string;
  shop: ShopDetailsViewModel;
  warrantyTitle: string;
}

export interface ShopProductsGroupViewModel {
  newNominated: ShopProductViewModel | null;
  newOnline: ShopProductViewModel[];
  newLocal: ShopProductViewModel[];
  takeOffNominated: ShopProductViewModel | null;
  takeOffOnline: ShopProductViewModel[];
  takeOffLocal: ShopProductViewModel[];
  stockNominated: ShopProductViewModel | null;
  stockOnline: ShopProductViewModel[];
  stockLocal: ShopProductViewModel[];
}

export interface ProductPageViewModel {
  product: ProductDetailsViewModel;
  shopProducts: ShopProductsGroupViewModel;
}

export interface PriceChartViewModel {
  dates: string[];
  prices: number[];
  averagePrice: string;
  minPrice: string;
  maxPrice: string;
}

export interface CommentsAverageViewModel {
  averageRate: number;
  allRatesCount: number;
  allCommentsCount: number;
  allInquiriesCount: number;
  starPercentages: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
}

export interface CommentItemViewModel {
  id: string;
  comment: string;
  rate: number;
  creator: string;
  likes: number;
  dislikes: number;
  repliesCount: number;
  createDateFormatted: string;
  isSellerComment: boolean;
  isBuyerUser: boolean;
  isYourComment: boolean;
  userBoughtFrom: string | null;
  userLiked: boolean;
  userDisLiked: boolean;
}

export interface InquiryItemViewModel {
  id: string;
  comment: string;
  creator: string;
  replyCount: number;
  likes: number;
  dislikes: number;
  isSellerComment: boolean;
  isBuyerUser: boolean;
  isYourComment: boolean;
  createDateFormatted: string;
  userLiked: boolean;
  userDisLiked: boolean;
  bestReply: InquiryItemViewModel | null;
}