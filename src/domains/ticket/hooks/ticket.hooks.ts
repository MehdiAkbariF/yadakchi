'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getTicketService } from '../services/ticket.service';
import { TicketFilters, CreateTicketRequest, CreateMessageRequest, TicketDetailsViewModel, TicketCategoryViewModel, TicketListItemViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

const ticketService = getTicketService();

export function useGetTicketCategories(type: 'User' | 'Seller' | 'ReturnRequest' | 'DamageReport' = 'User') {
  return useTypedQuery<TicketCategoryViewModel[]>(
    ['user', 'tickets', 'categories', type],
    () => ticketService.getTicketCategories(type),
    { staleTime: 15 * 60 * 1000 }
  );
}

export function useGetTicketDetails(id: string, currentUserId?: string) {
  return useTypedQuery<TicketDetailsViewModel>(
    ['user', 'tickets', 'details', id],
    () => ticketService.getTicketDetails(id, currentUserId),
    { enabled: !!id, staleTime: 30 * 1000 }
  );
}

export function useGetTicketsList(filters: TicketFilters) {
  return useTypedQuery<PaginatedResult<TicketListItemViewModel>>(
    ['user', 'tickets', 'list', filters],
    () => ticketService.getTicketsList(filters),
    { staleTime: 30 * 1000 }
  );
}

export function useGetDamageReportsList(filters: TicketFilters) {
  return useTypedQuery<PaginatedResult<TicketListItemViewModel>>(
    ['user', 'damage-reports', 'list', filters],
    () => ticketService.getDamageReportsList(filters),
    { staleTime: 30 * 1000 }
  );
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (request: CreateTicketRequest) => ticketService.createTicket(request),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'tickets', 'list'] });
      }
    }
  );
}

export function useCreateDamageReport() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (request: CreateTicketRequest) => ticketService.createDamageReport(request),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'damage-reports', 'list'] });
      }
    }
  );
}

export function useSendTicketMessage() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (request: CreateMessageRequest) => ticketService.sendTicketMessage(request),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['user', 'tickets', 'details', data.ticketId] });
      }
    }
  );
}

export function useMarkMessagesAsRead(ticketId: string) {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (messageIds: string[]) => ticketService.markMessagesAsRead(messageIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'tickets', 'details', ticketId] });
      }
    }
  );
}

export function useSetFeedbackHelpfulness(ticketId: string) {
  const queryClient = useQueryClient();
  return useTypedMutation(
    ({ messageId, wasHelpful }: { messageId: string; wasHelpful: boolean }) =>
      ticketService.setFeedbackHelpfulness(messageId, wasHelpful),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'tickets', 'details', ticketId] });
      }
    }
  );
}