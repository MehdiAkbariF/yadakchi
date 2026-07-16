export interface BrandDto {
  id: string;
  name: string;
  englishTitle: string;
  image: string | null;
  imageAlt: string | null;
}

export interface CarDto {
  id: string;
  carTypeId: string;
  carManufacturerId: string;
  model: string;
  isAutomatic: boolean | null;
  seoInformationId: string;
  englishTitle: string;
  description: string | null;
  cover: string | null;
  coverAlt: string | null;
}

export interface ProductDetailSpecDto {
  value: string;
  priority: number;
  name: string;
  isMain: boolean;
}

export interface ProductDetailGroupDto {
  priority: number;
  icon: string | null;
  iconAlt: string | null;
  name: string;
  productDetails: ProductDetailSpecDto[];
}

export interface SeoInfoDto {
  id: string;
  title: string;
  description: string;
  canonicalUrl: string;
}

export interface BreadCrumbDto {
  id: string;
  title: string;
  englishTitle: string;
}

export interface ProductDto {
  id: string;
  productCode: number;
  title: string;
  image: string;
  imageAlt: string;
  description: string;
  partNumber: string | null;
  averageRate: number;
  rateCount: number;
  likes: number;
  views: number;
  totalSalesCount: number;
  height: number;
  width: number;
  length: number;
  weight: number;
  brand: BrandDto;
  cars: CarDto[];
  productImageGallery: string[];
  productVideoGallery: string[];
  productDetails: ProductDetailGroupDto[];
  seoInformation: SeoInfoDto;
  tags: string[];
  breadCrumbs: BreadCrumbDto[];
}

export interface ShopDetailsDto {
  id: string;
  shopTitle: string;
  latitude: number;
  longitude: number;
  address: string;
  plaque: string;
  unit: string;
  tell: string | null;
  averageRate: number;
  logo: string | null;
}

export interface WarrantySupportDto {
  id: string;
  title: string;
  description: string;
}

export interface ShopProductDto {
  id: string;
  quantity: number;
  rialRetailPrice: number;
  finalRialPrice: number;
  discountPercentage: number;
  discountUntil: string | null;
  status: string;
  type: 'New' | 'Stock' | 'TakeOff';
  isAdvertised: boolean;
  isLocalSale: boolean;
  isTipaxShipping: boolean;
  isDirectShipping: boolean;
  dayOfDelivery: number;
  shop: ShopDetailsDto;
  warrantySupport: WarrantySupportDto;
}

export interface ShopProductsGroupDto {
  newNominatedShopProduct: ShopProductDto | null;
  newOnlineShopProducts: ShopProductDto[];
  newLocalShopProducts: ShopProductDto[];
  takeOffNominatedShopProduct: ShopProductDto | null;
  takeOffOnlineShopProducts: ShopProductDto[];
  takeOffLocalShopProducts: ShopProductDto[];
  stockNominatedShopProduct: ShopProductDto | null;
  stockOnlineShopProducts: ShopProductDto[];
  stockLocalShopProducts: ShopProductDto[];
}

export interface ProductPageResponseDto {
  product: ProductDto;
  shopProducts: ShopProductsGroupDto;
}

export interface PriceChartDto {
  dates: string[];
  prices: number[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface CommentsAverageDto {
  averageRate: number;
  allRatesCount: number;
  allCommentsCount: number;
  allInquiriesCount: number;
  fiveStarRatesCount: number;
  fourStarRatesCount: number;
  threeStarRatesCount: number;
  twoStarRatesCount: number;
  oneStarRatesCount: number;
}

export interface CommentItemDto {
  id: string;
  productId: string;
  comment: string;
  rate: number;
  commentCreator: string;
  likes: number;
  dislikes: number;
  parentId: string | null;
  isConfirmed: boolean;
  repliesCount: number;
  createDate: string;
  isSellerComment: boolean;
  isBuyerUser: boolean;
  isYourComment: boolean;
  userBoughtFrom: string | null;
  userLiked: boolean;
  userDisLiked: boolean;
}

export interface CommentsResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: CommentItemDto[];
}

export interface InquiryItemDto {
  id: string;
  productId: string;
  comment: string;
  inquiryCreator: string;
  parentId: string | null;
  isConfirmed: boolean;
  replyCount: number;
  likes: number;
  dislikes: number;
  isSellerComment: boolean;
  isBuyerUser: boolean;
  isYourComment: boolean;
  createDate: string;
  userLiked: boolean;
  userDisLiked: boolean;
  bestReply: InquiryItemDto | null;
}

export interface InquiriesResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: InquiryItemDto[];
}

export interface SearchProductKeywordItemApiDto {
  searchKeywordSuggestion: string;
  productTitles: string[];
  partId: string;
  partName: string;
  partEnglishTitle: string;
  partCategoryId: string;
  partCategoryName: string;
  partCategoryEnglishTitle: string;
}

export interface SearchProductKeywordsResponseApiDto {
  searchProductKeywords: SearchProductKeywordItemApiDto[];
}