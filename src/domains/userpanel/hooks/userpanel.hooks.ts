'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getUserPanelService } from '../services/userpanel.service';
import { OrderListItemViewModel, WalletViewModel, TransactionViewModel, UserVehicleViewModel, NotificationItemViewModel, WithdrawRequestItemViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';
import { OrderDetailsDto, BankAccountDto } from '../types/dto.types';

const userPanelService = getUserPanelService();

export function usePostShopRequest() {
  return useTypedMutation(
    () => userPanelService.postShopRequest()
  );
}

export function useGetOrderDetails(orderId: string) {
  return useTypedQuery<OrderDetailsDto>(
    ['user', 'orders', 'details', orderId],
    () => userPanelService.getOrder(orderId),
    { enabled: !!orderId }
  );
}

export function useGetOrders(status?: string, searchedValue?: string, orderBy?: string, pageNumber: number = 1) {
  return useTypedQuery<PaginatedResult<OrderListItemViewModel>>(
    ['user', 'orders', 'list', { status, searchedValue, orderBy, pageNumber }],
    () => userPanelService.getOrders(status, searchedValue, orderBy, pageNumber, 10),
    { staleTime: 30 * 1000 }
  );
}

export function useGetOrderReceipt(orderId: string) {
  return useTypedQuery<any>(
    ['user', 'orders', 'receipt', orderId],
    () => userPanelService.getOrderReceipt(orderId),
    { enabled: !!orderId }
  );
}

export function useRetryOrderPayment() {
  return useTypedMutation(
    (orderId: string) => userPanelService.retryOrderPayment(orderId)
  );
}

export function useGetSubOrderCancelReasons() {
  return useTypedQuery<any[]>(
    ['user', 'orders', 'cancel-reasons'],
    () => userPanelService.getSubOrderCancelReasons(),
    { staleTime: 10 * 60 * 1000 }
  );
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    ({ orderId, cancelationReasonId, userCancelationDescription }: { orderId: string; cancelationReasonId: string; userCancelationDescription: string }) =>
      userPanelService.cancelOrder(orderId, cancelationReasonId, userCancelationDescription),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'orders'] });
      }
    }
  );
}

export function useMarkSubOrderReceived() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (subOrderId: string) => userPanelService.markSubOrderReceived(subOrderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'orders'] });
      }
    }
  );
}

export function useMarkSubOrderNotReceived() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (subOrderId: string) => userPanelService.markSubOrderNotReceived(subOrderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'orders'] });
      }
    }
  );
}

export function useSubmitSubOrderItemFeedback() {
  return useTypedMutation(
    (payload: any) => userPanelService.submitSubOrderItemFeedback(payload)
  );
}

export function useGetReturnRequestReasons() {
  return useTypedQuery<any[]>(
    ['user', 'return-requests', 'reasons'],
    () => userPanelService.getReturnRequestReasons(),
    { staleTime: 10 * 60 * 1000 }
  );
}

export function useSubmitReturnRequest() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    ({ subOrderId, items }: { subOrderId: string; items: any[] }) =>
      userPanelService.submitReturnRequest(subOrderId, items),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'return-requests'] });
      }
    }
  );
}

export function useGetReturnRequestDetails(id: string) {
  return useTypedQuery<any>(
    ['user', 'return-requests', 'details', id],
    () => userPanelService.getReturnRequestDetails(id),
    { enabled: !!id }
  );
}

export function useGetReturnRequests(pageNumber: number = 1, status?: string, subOrderId?: string) {
  return useTypedQuery<PaginatedResult<any>>(
    ['user', 'return-requests', 'list', { pageNumber, status, subOrderId }],
    () => userPanelService.getReturnRequests(pageNumber, 10, status, subOrderId),
    { staleTime: 30 * 1000 }
  );
}

export function useSubmitReturnShipmentReceipt() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    ({ id, method, traceNumber, file }: { id: string; method: string; traceNumber: string; file: File }) =>
      userPanelService.submitReturnShipmentReceipt(id, method, traceNumber, file),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'return-requests'] });
      }
    }
  );
}

export function useGetWalletBalances() {
  return useTypedQuery<WalletViewModel>(
    ['user', 'wallet', 'balances'],
    () => userPanelService.getWalletBalances(),
    { staleTime: 30 * 1000 }
  );
}

export function useGetTransactions(pageNumber: number = 1) {
  return useTypedQuery<PaginatedResult<TransactionViewModel>>(
    ['user', 'wallet', 'transactions', pageNumber],
    () => userPanelService.getTransactions(pageNumber, 10),
    { staleTime: 30 * 1000 }
  );
}

export function useGetBankAccounts() {
  return useTypedQuery<BankAccountDto[]>(
    ['user', 'bank-accounts', 'list'],
    () => userPanelService.getBankAccounts(),
    { staleTime: 5 * 60 * 1000 }
  );
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    ({ cardNumber, shebaNumber }: { cardNumber: string; shebaNumber: string }) =>
      userPanelService.createBankAccount(cardNumber, shebaNumber),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'bank-accounts'] });
      }
    }
  );
}

export function useSetDefaultBankAccount() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (bankAccountId: string) => userPanelService.setDefaultBankAccount(bankAccountId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'bank-accounts'] });
      }
    }
  );
}

export function useGetUserVehicles() {
  return useTypedQuery<UserVehicleViewModel[]>(
    ['user', 'vehicles', 'list'],
    () => userPanelService.getUserVehicles(),
    { staleTime: 5 * 60 * 1000 }
  );
}

export function useCreateUserVehicle() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    ({ carId, title, isDefault }: { carId: string; title: string; isDefault: boolean }) =>
      userPanelService.createUserVehicle(carId, title, isDefault),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'vehicles'] });
      }
    }
  );
}

export function useUpdateUserVehicle() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    ({ id, title, mileage, oilKmLimit, lastServiceDate, isDefault }: { id: string; title: string; mileage: number | null; oilKmLimit: number | null; lastServiceDate: string | null; isDefault: boolean }) =>
      userPanelService.updateUserVehicle(id, title, mileage, oilKmLimit, lastServiceDate, isDefault),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'vehicles'] });
      }
    }
  );
}

export function useDeleteUserVehicle() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (id: string) => userPanelService.deleteUserVehicle(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'vehicles'] });
      }
    }
  );
}

export function useGetUserNotifications(pageNumber: number = 1, channel?: string, priority?: string) {
  return useTypedQuery<PaginatedResult<NotificationItemViewModel>>(
    ['user', 'notifications', 'list', { pageNumber, channel, priority }],
    () => userPanelService.getUserNotifications(pageNumber, 10, channel, priority),
    { staleTime: 30 * 1000 }
  );
}

export function useGetNotificationDetails(id: string) {
  return useTypedQuery<any>(
    ['user', 'notifications', 'details', id],
    () => userPanelService.getNotificationDetails(id),
    { enabled: !!id }
  );
}

export function useGetShopAdvantages() {
  return useTypedQuery<any[]>(
    ['user', 'shop-feedback', 'advantages'],
    () => userPanelService.getShopAdvantages(),
    { staleTime: 10 * 60 * 1000 }
  );
}

export function useGetShopDisadvantages() {
  return useTypedQuery<any[]>(
    ['user', 'shop-feedback', 'disadvantages'],
    () => userPanelService.getShopDisadvantages(),
    { staleTime: 10 * 60 * 1000 }
  );
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (formData: FormData) => userPanelService.updateProfile(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      }
    }
  );
}

export function useGetWithdrawRequests(pageNumber: number = 1, status?: string) {
  return useTypedQuery<PaginatedResult<WithdrawRequestItemViewModel>>(
    ['user', 'wallet', 'withdraw-requests', { pageNumber, status }],
    () => userPanelService.getWithdrawRequests(pageNumber, 10, status),
    { staleTime: 30 * 1000 }
  );
}

export function useSubmitWithdrawRequest() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    ({ amount, bankAccountId }: { amount: number; bankAccountId: string }) =>
      userPanelService.submitWithdrawRequest(amount, bankAccountId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'wallet'] });
      }
    }
  );
}

export function useGetFavoriteProducts(pageNumber: number = 1, order: string = 'Latest') {
  return useTypedQuery<PaginatedResult<any>>(
    ['user', 'favorites', 'list', { pageNumber, order }],
    () => userPanelService.getFavoriteProducts(pageNumber, 30, order),
    { staleTime: 30 * 1000 }
  );
}