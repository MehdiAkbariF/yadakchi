import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { INQUIRY_ENDPOINTS } from '../endpoints/inquiry.endpoints';
import { InquiryMapper } from '../mappers/inquiry.mapper';
import { UserPanelMapper } from '@/domains/userpanel/mappers/userpanel.mapper';
import { InquiryFilters, CreateInquiryRequest, LikeInquiryRequest } from '../types/view.types';
import { InquiryApiDto } from '../types/dto.types';
import { InquiryViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class InquiryService {
  private readonly httpClient = getHttpClient();

  async getProductInquiries(filters: InquiryFilters): Promise<PaginatedResult<InquiryViewModel>> {
    try {
      const params: Record<string, unknown> = {
        ProductId: filters.productId,
        OrderBy: filters.orderBy || 'Latest',
        PageNumber: filters.pageNumber || 1,
        PageSize: filters.pageSize || 30,
      };

      const response = await this.httpClient.get<{
        items: InquiryApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(INQUIRY_ENDPOINTS.GET_PRODUCT_INQUIRIES, { params });

      const items = response.data.items.map(dto => {
        const domain = InquiryMapper.toDomain(dto);
        return InquiryMapper.toView(domain);
      });

      return {
        items,
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        hasMore: response.data.hasNextPage,
        from: (response.data.pageNumber - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.pageNumber * response.data.pageSize, response.data.totalCount),
      };
    } catch (error) {
      logger.error('[InquiryService] Get product inquiries failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getInquiryReplies(inquiryId: string, pageNumber: number = 1, pageSize: number = 30): Promise<PaginatedResult<InquiryViewModel>> {
    try {
      const response = await this.httpClient.get<{
        items: InquiryApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(INQUIRY_ENDPOINTS.GET_INQUIRY_REPLIES, {
        params: { InquiryId: inquiryId, PageNumber: pageNumber, PageSize: pageSize }
      });

      const items = response.data.items.map(dto => {
        const domain = InquiryMapper.toDomain(dto);
        return InquiryMapper.toView(domain);
      });

      return {
        items,
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        hasMore: response.data.hasNextPage,
        from: (response.data.pageNumber - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.pageNumber * response.data.pageSize, response.data.totalCount),
      };
    } catch (error) {
      logger.error('[InquiryService] Get inquiry replies failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async createInquiry(request: CreateInquiryRequest): Promise<InquiryViewModel> {
    try {
      const dto = InquiryMapper.toCreateRequest(request);
      const response = await this.httpClient.post<InquiryApiDto>(
        INQUIRY_ENDPOINTS.POST_INQUIRY,
        dto
      );
      const domain = InquiryMapper.toDomain(response.data);
      return InquiryMapper.toView(domain);
    } catch (error) {
      logger.error('[InquiryService] Create inquiry failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async deleteInquiry(inquiryId: string): Promise<void> {
    try {
      await this.httpClient.delete(INQUIRY_ENDPOINTS.DELETE_INQUIRY, { id: inquiryId });
    } catch (error) {
      logger.error('[InquiryService] Delete inquiry failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async likeInquiry(request: LikeInquiryRequest): Promise<void> {
    try {
      const dto = InquiryMapper.toLikeRequest(request);
      await this.httpClient.post(INQUIRY_ENDPOINTS.POST_INQUIRY_LIKE, dto);
    } catch (error) {
      logger.error('[InquiryService] Like inquiry failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async unlikeInquiry(likeId: string): Promise<void> {
    try {
      await this.httpClient.delete(INQUIRY_ENDPOINTS.DELETE_INQUIRY_LIKE, {
        params: { id: likeId }
      });
    } catch (error) {
      logger.error('[InquiryService] Unlike inquiry failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getUserInquiries(pageNumber: number = 1, pageSize: number = 30): Promise<PaginatedResult<any>> {
    try {
      const response = await this.httpClient.get<{
        items: any[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(INQUIRY_ENDPOINTS.GET_USER_INQUIRIES, {
        params: { PageNumber: pageNumber, PageSize: pageSize }
      });

      const items = response.data.items.map(dto => {
        const domain = UserPanelMapper.toDomainUserInquiry(dto);
        return UserPanelMapper.toViewUserInquiry(domain);
      });

      return {
        items,
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        hasMore: response.data.hasNextPage,
        from: (response.data.pageNumber - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.pageNumber * response.data.pageSize, response.data.totalCount),
      };
    } catch (error) {
      logger.error('[InquiryService] Get user inquiries failed:', error);
      throw errorManager.normalize(error);
    }
  }
}

let inquiryServiceInstance: InquiryService | null = null;

export function getInquiryService(): InquiryService {
  if (!userPanelServiceInstance) {
    userPanelServiceInstance = new InquiryService();
  }
  return userPanelServiceInstance;
}

let userPanelServiceInstance: InquiryService | null = null;