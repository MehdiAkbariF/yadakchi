import { 
  OrderListItemDto, 
  WalletDto, 
  TransactionItemDto, 
  UserVehicleDto, 
  NotificationItemDto, 
  PendingCommentItemDto, 
  UserCommentItemDto, 
  UserInquiryItemDto, 
  ReturnRequestItemDto,
  WithdrawRequestItemDto,
  FavoriteProductItemDto
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
  ReturnRequestItem,
  WithdrawRequestItem
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
  ReturnRequestItemViewModel,
  WithdrawRequestItemViewModel
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
      mileage: domain.mileage !== null ? this.formatNumber(domain.mileage) + ' کیلومتر' : 'ثبت نشده',
      mileageRaw: domain.mileage,
      oilKmLimit: domain.oilKmLimit !== null ? this.formatNumber(domain.oilKmLimit) + ' کیلومتر' : 'ثبت نشده',
      oilKmLimitRaw: domain.oilKmLimit,
      lastServiceDateFormatted: domain.lastServiceDate 
        ? new Date(domain.lastServiceDate).toLocaleDateString('fa-IR') 
        : 'ثبت نشده',
      lastServiceDate: domain.lastServiceDate,
    };
  }

  static toDomainNotification(dto: NotificationItemDto): NotificationItem {
    return {
      id: dto.id,
      type: dto.type,
      title: dto.notificationContent?.title || '',
      body: dto.notificationContent?.body || '',
      imageUrl: dto.notificationContent?.imageUrl || null,
      linkType: dto.notificationContent?.linkType || null,
      linkText: dto.notificationContent?.linkText || null,
      channel: dto.notificationContent?.channel || 'System',
      priority: dto.notificationContent?.priority || null,
      isRead: dto.isRead || false,
      createDate: dto.createDate,
    };
  }

  static toViewNotification(domain: NotificationItem): NotificationItemViewModel {
    const channelLabels: Record<string, string> = {
      Information: 'اطلاع‌رسانی',
      AdminMessage: 'پیام مدیریت',
      SellerMessage: 'پیام فروشنده',
      Advertise: 'تبلیغات',
      Discount: 'تخفیف',
      WebBroadcastMessage: 'پیام سراسری',
      System: 'سیستم',
    };
    return {
      ...domain,
      channelLabel: channelLabels[domain.channel] || 'سیستم',
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

  static toDomainWithdrawRequest(dto: WithdrawRequestItemDto): WithdrawRequestItem {
    return {
      id: dto.id,
      amount: dto.amount,
      status: dto.status,
      statusLabel: dto.status === 'Pending' ? 'در انتظار پرداخت' : dto.status === 'Paid' ? 'پرداخت شده' : 'لغو شده',
      cardNumber: dto.bankAccount?.cardNumber || dto.cardNumber || '',
      shebaNumber: dto.bankAccount?.shebaNumber || dto.shebaNumber || '',
      createDate: dto.createDate,
    };
  }

  static toViewWithdrawRequest(domain: WithdrawRequestItem): WithdrawRequestItemViewModel {
    const colors: Record<string, 'warning' | 'success' | 'destructive'> = {
      Pending: 'warning',
      Paid: 'success',
      Cancelled: 'destructive',
    };
    return {
      ...domain,
      amount: this.formatPrice(domain.amount / 10) + ' تومان',
      statusColor: colors[domain.status] || 'warning',
      createDateFormatted: new Date(domain.createDate).toLocaleDateString('fa-IR'),
    };
  }

  static toFavoriteProductView(dto: FavoriteProductItemDto): any {
    return {
      id: dto.product.id,
      code: dto.product.productCode,
      title: dto.product.title,
      image: dto.product.image,
      imageAlt: dto.product.imageAlt,
      averageRate: dto.product.averageRate,
      views: dto.product.viewsAndClicks,
      salesCount: dto.product.totalSalesCount,
      isFavorite: true,
      price: {
        raw: dto.nominatedRialFinalPrice,
        formatted: this.formatPrice(dto.nominatedRialFinalPrice / 10)
      },
      nominatedShopProduct: dto.product.nominatedShopProduct ? {
        id: dto.product.nominatedShopProduct.id,
        shopTitle: dto.product.nominatedShopProduct.shopTitle,
        rialRetailPrice: dto.nominatedRialRetailPrice || dto.product.nominatedShopProduct.rialRetailPrice,
        rialFinalPrice: dto.nominatedRialFinalPrice || dto.product.nominatedShopProduct.rialFinalPrice,
        discountPercentage: dto.discountPercentage || dto.product.nominatedShopProduct.discountPercentage,
        type: dto.product.nominatedShopProduct.type,
        isAdvertised: dto.product.nominatedShopProduct.isAdvertised,
      } : null,
    };
  }

  static toRecentlyViewedProductView(dto: any): any {
    return {
      id: dto.productId,
      code: dto.productCode,
      title: dto.title,
      image: dto.image,
      averageRate: dto.averageRate,
      rateCount: dto.rateCount,
      views: 0,
      salesCount: 0,
      isFavorite: false,
      price: {
        raw: dto.rialFinalPrice,
        formatted: this.formatPrice(dto.rialFinalPrice / 10)
      },
      nominatedShopProduct: dto.nominatedShopProduct ? {
        id: dto.nominatedShopProduct.id,
        shopTitle: dto.nominatedShopProduct.shopTitle,
        rialRetailPrice: dto.rialRetailPrice,
        rialFinalPrice: dto.rialFinalPrice,
        discountPercentage: dto.discountPercentage,
        type: dto.nominatedShopProduct.type,
        isAdvertised: dto.nominatedShopProduct.isAdvertised,
      } : null,
    };
  }

  private static formatNumber(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(value);
  }

  private static formatPrice(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(Math.round(value));
  }
}