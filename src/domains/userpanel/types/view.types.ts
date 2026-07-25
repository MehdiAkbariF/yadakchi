export interface OrderListItemViewModel {
  id: string;
  status: string;
  statusLabel: string;
  orderNumber: number;
  totalOriginalPrice: string;
  totalDiscountValue: string;
  totalFinalPrice: string;
  totalShipmentPrice: string;
  subOrderItemCount: number;
  payableUntil: string;
  createDate: string;
  createDateFormatted: string;
  shopProductImages: string[];
}

export interface WalletViewModel {
  withdrawableBalance: string;
  unwithdrawableBalance: string;
  advertisementBalance: string;
  totalBalance: string;
}

export interface TransactionViewModel {
  type: string;
  typeLabel: string;
  amount: string;
  traceNo: string | null;
  isSuccess: boolean;
  createDate: string;
  createDateFormatted: string;
}

export interface UserVehicleViewModel {
  id: string;
  title: string;
  oilKmLimit: string;
  oilKmLimitRaw: number | null;
  mileage: string;
  mileageRaw: number | null;
  isDefault: boolean;
  lastServiceDate: string | null;
  lastServiceDateFormatted: string;
  createDate: string;
  carModel: string;
  carManufacturerName: string;
  carManufacturerLogo: string;
  carCover: string;
}

export interface NotificationItemViewModel {
  id: string;
  type: string;
  title: string;
  body: string;
  imageUrl: string | null;
  linkType: string | null;
  linkText: string | null;
  channel: string;
  channelLabel: string;
  priority: string | null;
  isRead: boolean;
  createDate: string;
  createDateFormatted: string;
}

export interface PendingCommentItemViewModel {
  productId: string;
  productTitle: string;
  productImage: string;
  shopTitle: string;
  lastSaleDate: string;
  lastSaleDateFormatted: string;
}

export interface UserCommentItemViewModel {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  comment: string;
  rate: number;
  likes: number;
  dislikes: number;
  isConfirmed: boolean;
  createDate: string;
  createDateFormatted: string;
}

export interface UserInquiryItemViewModel {
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
  createDateFormatted: string;
}

export interface ReturnRequestItemViewModel {
  id: string;
  requestNumber: number;
  status: string;
  statusLabel: string;
  shopTitle: string;
  shopLogo: string;
  totlaPayBackAmount: string;
  createDate: string;
  createDateFormatted: string;
  productImage: string;
  productTitle: string;
}

export interface WithdrawRequestItemViewModel {
  id: string;
  amount: string;
  status: 'Pending' | 'Paid' | 'Cancelled';
  statusLabel: string;
  statusColor: 'warning' | 'success' | 'destructive';
  cardNumber: string;
  shebaNumber: string;
  createDateFormatted: string;
}