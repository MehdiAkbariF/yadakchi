export interface SubOrderItemDto {
  id: string;
  shopProductId: string;
  quantity: number;
  status: string;
  originalPrice: number;
  discountAmount: number;
  discountPercent: number;
  finalUnitPrice: number;
  finalTotalPrice: number;
  shipmentPrice: number;
  shopProduct: {
    id: string;
    type: string;
    quantity: number;
    product: {
      id: string;
      productCode: number;
      title: string;
      image: string;
      description: string;
      partNumber: string | null;
      averageRate: number;
      rateCount: number;
      likes: number;
      views: number;
      brand: any;
    };
  };
  feedback: any;
}

export interface SubOrderDto {
  id: string;
  status: string;
  subOrderNumber: number;
  recieveDate: string | null;
  shipmentDate: string | null;
  shipmentMethod: string;
  directShipmentOption: string | null;
  traceNumber: string | null;
  driverFullName: string | null;
  driverMobile: string | null;
  shipmentCompanyName: string | null;
  shipmentReceiptImage: string | null;
  shopId: string;
  orderId: string;
  shipmentPrice: number;
  totalOriginalPrice: number;
  totalDiscountValue: number;
  totalFinalPrice: number;
  createDate: string;
  shop: {
    id: string;
    shopTitle: string;
    logo: string;
    highestDiscount: number;
    averageRate: number;
    ranking: number;
  };
  subOrderItems: SubOrderItemDto[];
}

export interface UserLocationDto {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  address: string;
  postalCode: string;
  plaque: string;
  unit: string;
  isUserReceiver: boolean;
  receiverFullName: string;
  receiverMobile: string;
  receiverNationalCode: string;
  cityId: string;
  city: string | null;
  provinceId: string | null;
  province: string | null;
  isDefault: boolean;
}

export interface OrderDetailsDto {
  id: string;
  orderNumber: number;
  status: string;
  discountCodeId: string | null;
  discountCodeValue: number | null;
  referalCodeUsed: string | null;
  referalCodeDiscountValue: number;
  totalOriginalPrice: number;
  totalDiscountValue: number;
  totalYadakchiDiscountValue: number;
  totalFinalPrice: number;
  totalShipmentPrice: number;
  createDate: string;
  payableUntil: string;
  userCancelationDescription: string | null;
  subOrders: SubOrderDto[];
  userLocation: UserLocationDto;
  transactions: any[];
}

export interface OrderListItemDto {
  id: string;
  status: string;
  orderNumber: number;
  totalOriginalPrice: number;
  totalDiscountValue: number;
  totalFinalPrice: number;
  totalShipmentPrice: number;
  subOrderItemCount: number;
  payableUntil: string;
  createDate: string;
  shopProductImages: string[];
}

export interface OrdersListResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: OrderListItemDto[];
}

export interface WalletDto {
  id: string;
  withdrawableBalance: number;
  unwithdrawableBalance: number;
  advertisementBalance: number;
}

export interface TransactionItemDto {
  type: string;
  amount: number;
  traceNo: string | null;
  isSuccess: boolean;
  createDate: string;
}

export interface TransactionsResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: TransactionItemDto[];
}

export interface BankAccountDto {
  id: string;
  shopId: string | null;
  cardNumber: string;
  shebaNumber: string;
  bankId: string | null;
  ownerName: string | null;
  isDefault: boolean;
  bank: any;
}

export interface VehicleCarDto {
  id: string;
  carTypeId: string;
  carManufacturerId: string;
  model: string;
  seoInformationId: string;
  englishTitle: string;
  description: string;
  cover: string;
  coverAlt: string;
  carManufacturer: {
    id: string;
    name: string;
    country: string | null;
    icon: string;
    iconAlt: string;
    countryFlag: string | null;
    countryName: string | null;
  };
}

export interface UserVehicleDto {
  id: string;
  title: string;
  oilKmLimit: number;
  nextServiceKM: number | null;
  mileage: number;
  isDefault: boolean;
  lastServiceDate: string;
  createDate: string;
  car: VehicleCarDto;
}

export interface NotificationContentDto {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  linkType: string | null;
  linkText: string | null;
  channel: string;
  priority: string | null;
  audienceType: string | null;
  receiverAppliationType: string;
}

export interface NotificationItemDto {
  id: string;
  type: string;
  notificationContent: NotificationContentDto;
  isRead: boolean;
  isReceived: boolean;
  createDate: string;
}

export interface NotificationsListResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: NotificationItemDto[];
}

export interface PendingCommentItemDto {
  productId: string;
  productTitle: string;
  productImage: string;
  shopTitle: string;
  lastSaleDate: string;
}

export interface PendingCommentsResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: PendingCommentItemDto[];
}

export interface UserCommentItemDto {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  comment: string;
  rate: number;
  likes: number;
  dislikes: number;
  replyCount: number;
  isConfirmed: boolean;
  updateRateAttempts: number;
  userBoughtFrom: string | null;
  isIncognito: boolean;
  createDate: string;
}

export interface UserCommentsResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: UserCommentItemDto[];
}

export interface UserInquiryItemDto {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  comment: string;
  likes: number;
  dislikes: number;
  replyCount: number;
  isConfirmed: boolean;
  createDate: string;
}

export interface UserInquiriesResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: UserInquiryItemDto[];
}

export interface ReturnRequestItemDto {
  id: string;
  returnRequestNumber: number;
  adminDescription: string;
  ticketId: string;
  subOrderId: string;
  sellerId: string | null;
  status: string;
  returnRequestReturnMethod: string;
  traceNumber: string;
  returnShipmentPrice: number;
  totalShipmentPaybackAmount: number;
  totalReturnShipmentPaybackAmount: number;
  totalItemPaybackAmount: number;
  totlaPayBackAmount: number;
  confirmedDate: string;
  sentDate: string | null;
  receivedDate: string | null;
  shop: {
    id: string;
    shopTitle: string;
    logo: string;
    highestDiscount: number;
    averageRate: number;
    ranking: number;
  };
  items: Array<{
    id: string;
    productImage: string;
    productTitle: string;
    quantity: number;
    description: string;
    returnRequestImages: Array<{ image: string }>;
  }>;
}

export interface ReturnRequestsListResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: ReturnRequestItemDto[];
}

export interface ReturnRequestReasonDto {
  id: string;
  name: string;
  description: string;
  penaltyFactor: number;
}

export interface SubOrderCancelReasonDto {
  id: string;
  name: string;
  description: string;
  penaltyFactor: number;
}

export interface AdvantageDto {
  id: string;
  title: string;
}