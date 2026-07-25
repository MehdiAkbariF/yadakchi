export interface OrderListItem {
  id: string;
  status: string;
  statusLabel: string;
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

export interface Wallet {
  id: string;
  withdrawableBalance: number;
  unwithdrawableBalance: number;
  advertisementBalance: number;
}

export interface Transaction {
  type: string;
  typeLabel: string;
  amount: number;
  traceNo: string | null;
  isSuccess: boolean;
  createDate: string;
}

export interface UserVehicle {
  id: string;
  title: string;
  oilKmLimit: number | null;
  mileage: number | null;
  isDefault: boolean;
  lastServiceDate: string | null;
  createDate: string;
  carModel: string;
  carManufacturerName: string;
  carManufacturerLogo: string;
  carCover: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  imageUrl: string | null;
  isRead: boolean;
  createDate: string;
}

export interface PendingCommentItem {
  productId: string;
  productTitle: string;
  productImage: string;
  shopTitle: string;
  lastSaleDate: string;
}

export interface UserCommentItem {
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
}

export interface UserInquiryItem {
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

export interface ReturnRequestItem {
  id: string;
  requestNumber: number;
  status: string;
  statusLabel: string;
  shopTitle: string;
  shopLogo: string;
  totlaPayBackAmount: number;
  createDate: string;
  productImage: string;
  productTitle: string;
}

export interface WithdrawRequestItem {
  id: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  statusLabel: string;
  cardNumber: string;
  shebaNumber: string;
  createDate: string;
}