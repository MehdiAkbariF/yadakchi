import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { TICKET_ENDPOINTS } from '../endpoints/ticket.endpoints';
import { TicketMapper } from '../mappers/ticket.mapper';
import { 
  TicketCategoryDto, 
  TicketDetailsDto, 
  TicketsListResponseDto, 
  TicketMessageDto 
} from '../types/dto.types';
import { 
  TicketCategoryViewModel, 
  TicketDetailsViewModel, 
  TicketListItemViewModel, 
  TicketMessageViewModel,
  CreateTicketRequest,
  CreateMessageRequest,
  TicketFilters
} from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class TicketService {
  private readonly httpClient = getHttpClient();

  async getTicketCategories(type: 'User' | 'Seller' | 'ReturnRequest' | 'DamageReport' = 'User'): Promise<TicketCategoryViewModel[]> {
    try {
      const response = await this.httpClient.get<TicketCategoryDto[]>(
        TICKET_ENDPOINTS.GET_CATEGORIES,
        { params: { Type: type } }
      );
      return (response.data || []).map(dto => TicketMapper.toViewCategory(TicketMapper.toDomainCategory(dto)));
    } catch (error) {
      logger.error('[TicketService] Get ticket categories failed:', error);
      return [];
    }
  }

  async createTicket(request: CreateTicketRequest): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('CategoryId', request.categoryId);
      formData.append('Title', request.title);
      formData.append('Text', request.text);
      if (request.orderNumber) {
        formData.append('OrderNumber', String(request.orderNumber));
      }
      if (request.attachments) {
        request.attachments.forEach(file => {
          formData.append('Attachments', file);
        });
      }

      await this.httpClient.post(TICKET_ENDPOINTS.POST_TICKET, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      logger.error('[TicketService] Create ticket failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async createDamageReport(request: CreateTicketRequest): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('CategoryId', request.categoryId);
      formData.append('Title', request.title);
      formData.append('Text', request.text);
      if (request.orderNumber) {
        formData.append('OrderNumber', String(request.orderNumber));
      }
      if (request.attachments) {
        request.attachments.forEach(file => {
          formData.append('Attachments', file);
        });
      }

      await this.httpClient.post(TICKET_ENDPOINTS.POST_DAMAGE_REPORT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      logger.error('[TicketService] Create damage report failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getTicketDetails(id: string, currentUserId?: string): Promise<TicketDetailsViewModel> {
    try {
      const response = await this.httpClient.get<TicketDetailsDto>(
        TICKET_ENDPOINTS.GET_TICKET,
        { params: { Id: id } }
      );
      return TicketMapper.toViewDetails(TicketMapper.toDomainDetails(response.data), currentUserId);
    } catch (error) {
      logger.error('[TicketService] Get ticket details failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getTicketsList(filters: TicketFilters): Promise<PaginatedResult<TicketListItemViewModel>> {
    try {
      const response = await this.httpClient.get<TicketsListResponseDto>(
        TICKET_ENDPOINTS.GET_TICKETS,
        {
          params: {
            PageNumber: filters.pageNumber || 1,
            PageSize: filters.pageSize || 30,
            Status: filters.status || '',
            OrderBy: filters.orderBy || '',
          }
        }
      );
      const items = (response.data.items || []).map(dto => TicketMapper.toViewListItem(TicketMapper.toDomainListItem(dto)));
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
      logger.error('[TicketService] Get tickets list failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getDamageReportsList(filters: TicketFilters): Promise<PaginatedResult<TicketListItemViewModel>> {
    try {
      const response = await this.httpClient.get<TicketsListResponseDto>(
        TICKET_ENDPOINTS.GET_DAMAGE_REPORTS,
        {
          params: {
            PageNumber: filters.pageNumber || 1,
            PageSize: filters.pageSize || 30,
            Status: filters.status || '',
            OrderBy: filters.orderBy || '',
          }
        }
      );
      const items = (response.data.items || []).map(dto => TicketMapper.toViewListItem(TicketMapper.toDomainListItem(dto)));
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
      logger.error('[TicketService] Get damage reports list failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async sendTicketMessage(request: CreateMessageRequest): Promise<TicketMessageViewModel> {
    try {
      const formData = new FormData();
      formData.append('Text', request.text);
      formData.append('TicketId', request.ticketId);
      if (request.wasHelpful !== undefined) {
        formData.append('WasHelpful', String(request.wasHelpful));
      }
      if (request.attachments) {
        request.attachments.forEach(file => {
          formData.append('Attachments', file);
        });
      }

      const response = await this.httpClient.post<TicketMessageDto>(
        TICKET_ENDPOINTS.POST_MESSAGE,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return TicketMapper.toViewMessage(TicketMapper.toDomainMessage(response.data));
    } catch (error) {
      logger.error('[TicketService] Send ticket message failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    try {
      const formData = new FormData();
      messageIds.forEach(id => {
        formData.append('MessageIds', id);
      });
      await this.httpClient.post(TICKET_ENDPOINTS.POST_READ_MESSAGES, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      logger.error('[TicketService] Mark messages as read failed:', error);
    }
  }

  async setFeedbackHelpfulness(messageId: string, wasHelpful: boolean): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('MessageId', messageId);
      formData.append('WasHalpful', String(wasHelpful));
      await this.httpClient.post(TICKET_ENDPOINTS.POST_HELPFUL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      logger.error('[TicketService] Set feedback helpfulness failed:', error);
      throw errorManager.normalize(error);
    }
  }
}

let ticketServiceInstance: TicketService | null = null;

export function getTicketService(): TicketService {
  if (!ticketServiceInstance) {
    ticketServiceInstance = new TicketService();
  }
  return ticketServiceInstance;
}