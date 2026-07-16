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