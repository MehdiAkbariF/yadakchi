import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { USERPANEL_ENDPOINTS } from '../endpoints/userpanel.endpoints';
import { UserPanelMapper } from '../mappers/userpanel.mapper';
import { 
  OrdersListResponseDto, 
  OrderDetailsDto, 
  WalletDto, 
  TransactionsResponseDto, 
  BankAccountDto, 
  UserVehicleDto, 
  NotificationsListResponseDto, 
  WithdrawRequestsResponseDto,
  FavoriteProductsResponseDto
} from '../types/dto.types';
import { 
  OrderListItemViewModel, 
  WalletViewModel, 
  TransactionViewModel, 
  UserVehicleViewModel, 
  NotificationItemViewModel, 
  WithdrawRequestItemViewModel
} from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class UserPanelService {
  private readonly httpClient = getHttpClient();

  async postShopRequest(): Promise<void> {
    try {
      await this.httpClient.post(USERPANEL_ENDPOINTS.POST_SHOP_REQUEST);
    } catch (error) {
      logger.error('[UserPanelService] Post shop request failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getOrder(orderId: string): Promise<OrderDetailsDto> {
    try {
      const response = await this.httpClient.get<OrderDetailsDto>(
        USERPANEL_ENDPOINTS.GET_ORDER,
        { params: { Id: orderId } }
      );
      return response.data;
    } catch (error) {
      logger.error('[UserPanelService] Get order failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getOrders(status?: string, searchedValue?: string, orderBy?: string, pageNumber: number = 1, pageSize: number = 30): Promise<PaginatedResult<OrderListItemViewModel>> {
    try {
      const response = await this.httpClient.get<OrdersListResponseDto>(
        USERPANEL_ENDPOINTS.GET_ORDERS,
        {
          params: {
            Status: status || '',
            SearchedValue: searchedValue || '',
            OrderBy: orderBy || '',
            PageNumber: pageNumber,
            PageSize: pageSize
          }
        }
      );
      const items = (response.data.items || []).map(dto => UserPanelMapper.toViewOrder(UserPanelMapper.toDomainOrder(dto)));
      return {
        items,
        pageNumber: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.currentPage < response.data.totalPages,
        hasPreviousPage: response.data.currentPage > 1,
        hasMore: response.data.currentPage < response.data.totalPages,
        from: (response.data.currentPage - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.currentPage * response.data.pageSize, response.data.totalCount)
      };
    } catch (error) {
      logger.error('[UserPanelService] Get orders failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getOrderReceipt(orderId: string): Promise<any> {
    try {
      const response = await this.httpClient.get<any>(
        USERPANEL_ENDPOINTS.GET_ORDER_RECEIPT,
        { params: { OrderId: orderId } }
      );
      return response.data;
    } catch (error) {
      logger.error('[UserPanelService] Get order receipt failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async retryOrderPayment(orderId: string): Promise<void> {
    try {
      await this.httpClient.post(USERPANEL_ENDPOINTS.RETRY_PAYMENT, { orderId });
    } catch (error) {
      logger.error('[UserPanelService] Retry order payment failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getSubOrderCancelReasons(): Promise<any[]> {
    try {
      const response = await this.httpClient.get<any[]>(
        USERPANEL_ENDPOINTS.GET_CANCEL_REASONS
      );
      return response.data;
    } catch (error) {
      logger.error('[UserPanelService] Get suborder cancel reasons failed:', error);
      return [];
    }
  }

  async cancelOrder(orderId: string, cancelationReasonId: string, userCancelationDescription: string): Promise<void> {
    try {
      await this.httpClient.post(USERPANEL_ENDPOINTS.CANCEL_ORDER, {
        orderId,
        cancelationReasonId,
        userCancelationDescription
      });
    } catch (error) {
      logger.error('[UserPanelService] Cancel order failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async markSubOrderReceived(subOrderId: string): Promise<void> {
    try {
      await this.httpClient.post(USERPANEL_ENDPOINTS.MARK_SUBORDER_RECEIVED, { subOrderId });
    } catch (error) {
      logger.error('[UserPanelService] Mark suborder received failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async markSubOrderNotReceived(subOrderId: string): Promise<void> {
    try {
      await this.httpClient.post(USERPANEL_ENDPOINTS.MARK_SUBORDER_NOT_RECEIVED, { subOrderId });
    } catch (error) {
      logger.error('[UserPanelService] Mark suborder not received failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async submitSubOrderItemFeedback(payload: any): Promise<void> {
    try {
      await this.httpClient.post(USERPANEL_ENDPOINTS.POST_SHOP_COMMENT, payload);
    } catch (error) {
      logger.error('[UserPanelService] Submit item feedback failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getReturnRequestReasons(): Promise<any[]> {
    try {
      const response = await this.httpClient.get<any[]>(
        USERPANEL_ENDPOINTS.GET_RETURN_REASONS
      );
      return response.data;
    } catch (error) {
      logger.error('[UserPanelService] Get return request reasons failed:', error);
      return [];
    }
  }

  async submitReturnRequest(subOrderId: string, items: any[]): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('SubOrderId', subOrderId);
      formData.append('Items', JSON.stringify(items));
      await this.httpClient.post(USERPANEL_ENDPOINTS.POST_RETURN_REQUEST, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      logger.error('[UserPanelService] Submit return request failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getReturnRequestDetails(id: string): Promise<any> {
    try {
      const response = await this.httpClient.get<any>(
        USERPANEL_ENDPOINTS.GET_RETURN_REQUEST,
        { params: { Id: id } }
      );
      return response.data;
    } catch (error) {
      logger.error('[UserPanelService] Get return request details failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getReturnRequests(pageNumber: number = 1, pageSize: number = 30, status?: string, subOrderId?: string): Promise<PaginatedResult<any>> {
    try {
      const response = await this.httpClient.get<any>(
        USERPANEL_ENDPOINTS.GET_RETURN_REQUESTS,
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            Status: status || '',
            SubOrderId: subOrderId || ''
          }
        }
      );
      const items = (response.data.items || []).map((dto: any) => UserPanelMapper.toViewReturnRequest(UserPanelMapper.toDomainReturnRequest(dto)));
      return {
        items,
        pageNumber: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.currentPage < response.data.totalPages,
        hasPreviousPage: response.data.currentPage > 1,
        hasMore: response.data.currentPage < response.data.totalPages,
        from: (response.data.currentPage - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.currentPage * response.data.pageSize, response.data.totalCount)
      };
    } catch (error) {
      logger.error('[UserPanelService] Get return requests failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async submitReturnShipmentReceipt(id: string, method: string, traceNumber: string, file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('Id', id);
      formData.append('Method', method);
      formData.append('TraceNumber', traceNumber);
      formData.append('ReturnShipmentReceipt', file);
      await this.httpClient.post(USERPANEL_ENDPOINTS.POST_RETURN_SHIPMENT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      logger.error('[UserPanelService] Submit return shipment receipt failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getWalletBalances(): Promise<WalletViewModel> {
    try {
      const response = await this.httpClient.get<WalletDto>(
        USERPANEL_ENDPOINTS.GET_WALLET
      );
      return UserPanelMapper.toViewWallet(UserPanelMapper.toDomainWallet(response.data));
    } catch (error) {
      logger.error('[UserPanelService] Get wallet balances failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getTransactions(pageNumber: number = 1, pageSize: number = 30): Promise<PaginatedResult<TransactionViewModel>> {
    try {
      const response = await this.httpClient.get<TransactionsResponseDto>(
        USERPANEL_ENDPOINTS.GET_TRANSACTIONS,
        { params: { PageNumber: pageNumber, PageSize: pageSize } }
      );
      const items = (response.data.items || []).map(dto => UserPanelMapper.toViewTransaction(UserPanelMapper.toDomainTransaction(dto)));
      return {
        items,
        pageNumber: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.currentPage < response.data.totalPages,
        hasPreviousPage: response.data.currentPage > 1,
        hasMore: response.data.currentPage < response.data.totalPages,
        from: (response.data.currentPage - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.currentPage * response.data.pageSize, response.data.totalCount)
      };
    } catch (error) {
      logger.error('[UserPanelService] Get transactions failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getBankAccounts(): Promise<BankAccountDto[]> {
    try {
      const response = await this.httpClient.get<BankAccountDto[]>(
        USERPANEL_ENDPOINTS.GET_BANK_ACCOUNTS
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('[UserPanelService] Get bank accounts failed:', error);
      return [];
    }
  }

  async createBankAccount(cardNumber: string, shebaNumber: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('CardNumber', cardNumber);
      formData.append('ShebaNumber', shebaNumber);
      await this.httpClient.post(USERPANEL_ENDPOINTS.POST_BANK_ACCOUNT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      logger.error('[UserPanelService] Create bank account failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async setDefaultBankAccount(bankAccountId: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('BankAccountId', bankAccountId);
      await this.httpClient.put(USERPANEL_ENDPOINTS.PUT_DEFAULT_BANK_ACCOUNT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      logger.error('[UserPanelService] Set default bank account failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getUserVehicles(): Promise<UserVehicleViewModel[]> {
    try {
      const response = await this.httpClient.get<UserVehicleDto[]>(
        USERPANEL_ENDPOINTS.GET_VEHICLES
      );
      return (response.data || []).map(dto => UserPanelMapper.toViewVehicle(UserPanelMapper.toDomainVehicle(dto)));
    } catch (error) {
      logger.error('[UserPanelService] Get user vehicles failed:', error);
      throw error;
    }
  }

  async createUserVehicle(carId: string, title: string, isDefault: boolean): Promise<void> {
    try {
      await this.httpClient.post(USERPANEL_ENDPOINTS.POST_VEHICLE, { carId, title, isDefault });
    } catch (error) {
      logger.error('[UserPanelService] Create user vehicle failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async updateUserVehicle(id: string, title: string, mileage: number | null, oilKmLimit: number | null, lastServiceDate: string | null, isDefault: boolean): Promise<void> {
    try {
      await this.httpClient.put(USERPANEL_ENDPOINTS.PUT_VEHICLE, {
        id,
        title,
        mileage,
        oilKmLimit,
        lastServiceDate,
        isDefault
      });
    } catch (error) {
      logger.error('[UserPanelService] Update user vehicle failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async deleteUserVehicle(id: string): Promise<void> {
    try {
      await this.httpClient.delete(USERPANEL_ENDPOINTS.DELETE_VEHICLE, { id });
    } catch (error) {
      logger.error('[UserPanelService] Delete user vehicle failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getUserNotifications(pageNumber: number = 1, pageSize: number = 30, channel?: string, priority?: string, audienceType?: string, receiverAppliationType?: string, timePeriod?: string, isRead?: boolean, orderBy?: 'Latest' | 'Oldest'): Promise<PaginatedResult<NotificationItemViewModel>> {
    try {
      const response = await this.httpClient.get<NotificationsListResponseDto>(
        USERPANEL_ENDPOINTS.GET_NOTIFICATIONS,
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            Channel: channel || '',
            Priority: priority || '',
            AudienceType: audienceType || '',
            ReceiverAppliationType: receiverAppliationType || '',
            TimePeriod: timePeriod || '',
            IsRead: isRead !== undefined ? isRead : '',
            OrderBy: orderBy || 'Latest'
          }
        }
      );
      const items = (response.data.items || []).map(dto => UserPanelMapper.toViewNotification(UserPanelMapper.toDomainNotification(dto)));
      return {
        items,
        pageNumber: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.currentPage < response.data.totalPages,
        hasPreviousPage: response.data.currentPage > 1,
        hasMore: response.data.currentPage < response.data.totalPages,
        from: (response.data.currentPage - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.currentPage * response.data.pageSize, response.data.totalCount)
      };
    } catch (error) {
      logger.error('[UserPanelService] Get user notifications failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getNotificationDetails(id: string): Promise<any> {
    try {
      const response = await this.httpClient.get<any>(
        USERPANEL_ENDPOINTS.GET_NOTIFICATION,
        { params: { Id: id } }
      );
      return response.data;
    } catch (error) {
      logger.error('[UserPanelService] Get notification details failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getShopAdvantages(): Promise<any[]> {
    try {
      const response = await this.httpClient.get<any[]>(
        USERPANEL_ENDPOINTS.GET_ADVANTAGES
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('[UserPanelService] Get shop advantages failed:', error);
      return [];
    }
  }

  async getShopDisadvantages(): Promise<any[]> {
    try {
      const response = await this.httpClient.get<any[]>(
        USERPANEL_ENDPOINTS.GET_DISADVANTAGES
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('[UserPanelService] Get shop disadvantages failed:', error);
      return [];
    }
  }

  async updateProfile(formData: FormData): Promise<void> {
    try {
      await this.httpClient.put(USERPANEL_ENDPOINTS.PUT_USER_PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      logger.error('[UserPanelService] Update profile failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getWithdrawRequests(pageNumber: number = 1, pageSize: number = 30, status?: string): Promise<PaginatedResult<WithdrawRequestItemViewModel>> {
    try {
      const response = await this.httpClient.get<WithdrawRequestsResponseDto>(
        USERPANEL_ENDPOINTS.GET_WITHDRAW_REQUESTS,
        { params: { PageNumber: pageNumber, PageSize: pageSize, Status: status || '' } }
      );
      const items = (response.data.items || []).map(dto => UserPanelMapper.toViewWithdrawRequest(UserPanelMapper.toDomainWithdrawRequest(dto)));
      return {
        items,
        pageNumber: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.currentPage < response.data.totalPages,
        hasPreviousPage: response.data.currentPage > 1,
        hasMore: response.data.currentPage < response.data.totalPages,
        from: (response.data.currentPage - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.currentPage * response.data.pageSize, response.data.totalCount)
      };
    } catch (error) {
      logger.error('[UserPanelService] Get withdraw requests failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async submitWithdrawRequest(amount: number, bankAccountId: string): Promise<void> {
    try {
      await this.httpClient.post(USERPANEL_ENDPOINTS.POST_WITHDRAW, {
        amount,
        bankAccountId
      });
    } catch (error) {
      logger.error('[UserPanelService] Submit withdraw request failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getFavoriteProducts(pageNumber: number = 1, pageSize: number = 30, order: string = 'Latest'): Promise<PaginatedResult<any>> {
    try {
      const response = await this.httpClient.get<FavoriteProductsResponseDto>(
        USERPANEL_ENDPOINTS.GET_FAVORITES,
        { params: { PageNumber: pageNumber, PageSize: pageSize, Order: order } }
      );
      const items = (response.data.items || []).map(dto => UserPanelMapper.toFavoriteProductView(dto));
      return {
        items,
        pageNumber: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.currentPage < response.data.totalPages,
        hasPreviousPage: response.data.currentPage > 1,
        hasMore: response.data.currentPage < response.data.totalPages,
        from: (response.data.currentPage - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.currentPage * response.data.pageSize, response.data.totalCount)
      };
    } catch (error) {
      logger.error('[UserPanelService] Get favorite products failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getRecentlyViewedProducts(): Promise<any[]> {
    try {
      const response = await this.httpClient.get<any[]>(
        USERPANEL_ENDPOINTS.GET_RECENT_VIEWS
      );
      return (response.data || []).map(dto => UserPanelMapper.toRecentlyViewedProductView(dto));
    } catch (error) {
      logger.error('[UserPanelService] Get recently viewed products failed:', error);
      throw errorManager.normalize(error);
    }
  }
}

let userPanelServiceInstance: UserPanelService | null = null;

export function getUserPanelService(): UserPanelService {
  if (!userPanelServiceInstance) {
    userPanelServiceInstance = new UserPanelService();
  }
  return userPanelServiceInstance;
}