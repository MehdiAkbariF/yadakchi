import { 
  OrderListItemDto, 
  WalletDto, 
  TransactionItemDto, 
  UserVehicleDto, 
  NotificationItemDto, 
  PendingCommentItemDto, 
  UserCommentItemDto, 
  UserInquiryItemDto, 
  ReturnRequestItemDto 
} from '../types/dto.types';
import { 
  OrderListItem, 
  Wallet, 
  Transaction, 
  UserVehicle, 
  NotificationItem, 
  PendingCommentItem, 
  UserCommentItem, 
  UserInquiryItem, 
  ReturnRequestItem 
} from '../types/domain.types';
import { 
  OrderListItemViewModel, 
  WalletViewModel, 
  TransactionViewModel, 
  UserVehicleViewModel, 
  NotificationItemViewModel, 
  PendingCommentItemViewModel, 
  UserCommentItemViewModel, 
  UserInquiryItemViewModel, 
  ReturnRequestItemViewModel 
} from '../types/view.types';
import { USERPANEL_CONSTANTS } from '../constants/userpanel.constants';

export class UserPanelMapper {
  static toDomainOrder(dto: OrderListItemDto): OrderListItem {
    return {
      id: dto.id,
      status: dto.status,
      statusLabel: USERPANEL_CONSTANTS.ORDER_STATUS[dto.status as keyof typeof USERPANEL_CONSTANTS.ORDER_STATUS] || dto.status,
      orderNumber: dto.orderNumber,
      totalOriginalPrice: dto.totalOriginalPrice,
      totalDiscountValue: dto.totalDiscountValue,
      totalFinalPrice: dto.totalFinalPrice,
      totalShipmentPrice: dto.totalShipmentPrice,
      subOrderItemCount: dto.subOrderItemCount,
      payableUntil: dto.payableUntil,
      createDate: dto.createDate,
      shopProductImages: dto.shopProductImages || [],
    };
  }

  static toViewOrder(domain: OrderListItem): OrderListItemViewModel {
    return {
      ...domain,
      totalOriginalPrice: this.formatPrice(domain.totalOriginalPrice / 10) + ' تومان',
      totalDiscountValue: this.formatPrice(domain.totalDiscountValue / 10) + ' تومان',
      totalFinalPrice: this.formatPrice(domain.totalFinalPrice / 10) + ' تومان',
      totalShipmentPrice: this.formatPrice(domain.totalShipmentPrice / 10) + ' تومان',
      createDateFormatted: new Date(domain.createDate).toLocaleDateString('fa-IR'),
    };
  }

  static toDomainWallet(dto: WalletDto): Wallet {
    return {
      id: dto.id,
      withdrawableBalance: dto.withdrawableBalance,
      unwithdrawableBalance: dto.unwithdrawableBalance,
      advertisementBalance: dto.advertisementBalance,
    };
  }

  static toViewWallet(domain: Wallet): WalletViewModel {
    const total = domain.withdrawableBalance + domain.unwithdrawableBalance;
    return {
      withdrawableBalance: this.formatPrice(domain.withdrawableBalance / 10) + ' تومان',
      unwithdrawableBalance: this.formatPrice(domain.unwithdrawableBalance / 10) + ' تومان',
      advertisementBalance: this.formatPrice(domain.advertisementBalance / 10) + ' تومان',
      totalBalance: this.formatPrice(total / 10) + ' تومان',
    };
  }

  static toDomainTransaction(dto: TransactionItemDto): Transaction {
    return {
      type: dto.type,
      typeLabel: USERPANEL_CONSTANTS.TRANSACTION_TYPES[dto.type as keyof typeof USERPANEL_CONSTANTS.TRANSACTION_TYPES] || dto.type,
      amount: dto.amount,
      traceNo: dto.traceNo,
      isSuccess: dto.isSuccess,
      createDate: dto.createDate,
    };
  }

  static toViewTransaction(domain: Transaction): TransactionViewModel {
    return {
      ...domain,
      amount: this.formatPrice(domain.amount / 10) + ' تومان',
      createDateFormatted: new Date(domain.createDate).toLocaleDateString('fa-IR'),
    };
  }

  static toDomainVehicle(dto: UserVehicleDto): UserVehicle {
    return {
      id: dto.id,
      title: dto.title,
      oilKmLimit: dto.oilKmLimit,
      mileage: dto.mileage,
      isDefault: dto.isDefault,
      lastServiceDate: dto.lastServiceDate,
      createDate: dto.createDate,
      carModel: dto.car?.model || '',
      carManufacturerName: dto.car?.carManufacturer?.name || '',
      carManufacturerLogo: dto.car?.carManufacturer?.icon || '',
      carCover: dto.car?.cover || '',
    };
  }

  static toViewVehicle(domain: UserVehicle): UserVehicleViewModel {
    return {
      ...domain,
      mileage: this.formatNumber(domain.mileage) + ' کیلومتر',
      oilKmLimit: this.formatNumber(domain.oilKmLimit) + ' کیلومتر',
      lastServiceDateFormatted: new Date(domain.lastServiceDate).toLocaleDateString('fa-IR'),
    };
  }

  static toDomainNotification(dto: NotificationItemDto): NotificationItem {
    return {
      id: dto.id,
      type: dto.type,
      title: dto.notificationContent?.title || '',
      body: dto.notificationContent?.body || '',
      imageUrl: dto.notificationContent?.imageUrl || null,
      isRead: dto.isRead || false,
      createDate: dto.createDate,
    };
  }

  static toViewNotification(domain: NotificationItem): NotificationItemViewModel {
    return {
      ...domain,
      createDateFormatted: new Date(domain.createDate).toLocaleDateString('fa-IR'),
    };
  }

  static toDomainPendingComment(dto: PendingCommentItemDto): PendingCommentItem {
    return {
      productId: dto.productId,
      productTitle: dto.productTitle,
      productImage: dto.productImage,
      shopTitle: dto.shopTitle,
      lastSaleDate: dto.lastSaleDate,
    };
  }

  static toViewPendingComment(domain: PendingCommentItem): PendingCommentItemViewModel {
    return {
      ...domain,
      lastSaleDateFormatted: new Date(domain.lastSaleDate).toLocaleDateString('fa-IR'),
    };
  }

  static toDomainUserComment(dto: UserCommentItemDto): UserCommentItem {
    return {
      id: dto.id,
      productId: dto.productId,
      productTitle: dto.productTitle,
      productImage: dto.productImage,
      comment: dto.comment || '',
      rate: dto.rate,
      likes: dto.likes,
      dislikes: dto.dislikes,
      isConfirmed: dto.isConfirmed,
      createDate: dto.createDate,
    };
  }

  static toViewUserComment(domain: UserCommentItem): UserCommentItemViewModel {
    return {
      ...domain,
      createDateFormatted: new Date(domain.createDate).toLocaleDateString('fa-IR'),
    };
  }

  static toDomainUserInquiry(dto: UserInquiryItemDto): UserInquiryItem {
    return {
      id: dto.id,
      productId: dto.productId,
      productTitle: dto.productTitle,
      productImage: dto.productImage,
      comment: dto.comment,
      likes: dto.likes,
      dislikes: dto.dislikes,
      replyCount: dto.replyCount,
      isConfirmed: dto.isConfirmed,
      createDate: dto.createDate,
    };
  }

  static toViewUserInquiry(domain: UserInquiryItem): UserInquiryItemViewModel {
    return {
      ...domain,
      createDateFormatted: new Date(domain.createDate).toLocaleDateString('fa-IR'),
    };
  }

  static toDomainReturnRequest(dto: ReturnRequestItemDto): ReturnRequestItem {
    const mainItem = dto.items?.[0];
    return {
      id: dto.id,
      requestNumber: dto.returnRequestNumber,
      status: dto.status,
      statusLabel: dto.status === 'Received' ? 'تحویل شده' : 'در انتظار بررسی',
      shopTitle: dto.shop?.shopTitle || '',
      shopLogo: dto.shop?.logo || '',
      totlaPayBackAmount: dto.totlaPayBackAmount,
      createDate: dto.confirmedDate,
      productImage: mainItem?.productImage || '',
      productTitle: mainItem?.productTitle || '',
    };
  }

  static toViewReturnRequest(domain: ReturnRequestItem): ReturnRequestItemViewModel {
    return {
      ...domain,
      totlaPayBackAmount: this.formatPrice(domain.totlaPayBackAmount / 10) + ' تومان',
      createDateFormatted: new Date(domain.createDate).toLocaleDateString('fa-IR'),
    };
  }

  private static formatNumber(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(value);
  }

  private static formatPrice(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(Math.round(value));
  }
}