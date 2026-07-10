// src/domains/front/static/services/static.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { STATIC_ENDPOINTS } from '../endpoints/static.endpoints';
import { StaticMapper } from '../mappers/static.mapper';
import { 

  FAQFilters, 
  ContactUsRequest, 
  NewsletterRequest 
} from '../types/view.types';
import { 
  StaticPageApiDto, 
  StaticPageCategoryApiDto,
  FAQApiDto,
  ContactUsSubjectApiDto,
  ToolTipApiDto,
  MarketMessageApiDto
} from '../types/dto.types';
import { 
  StaticPageViewModel, 
  StaticPageCategoryViewModel,
  FAQViewModel,
  ContactUsSubjectViewModel,
  ToolTipViewModel,
  MarketMessageViewModel
} from '../types/view.types';

export class StaticService {
  private readonly httpClient = getHttpClient();

  async getStaticPage(title: string): Promise<StaticPageViewModel | null> {
    try {
      const response = await this.httpClient.get<StaticPageApiDto>(
        STATIC_ENDPOINTS.GET_STATIC_PAGE,
        { params: { Title: title } }
      );

      const domain = StaticMapper.toDomainPage(response.data);
      return StaticMapper.toViewPage(domain);
    } catch (error) {
      logger.error('[StaticService] Get static page failed:', error);
      return null;
    }
  }

  async getStaticPageCategories(): Promise<StaticPageCategoryViewModel[]> {
    try {
      const response = await this.httpClient.get<StaticPageCategoryApiDto[]>(
        STATIC_ENDPOINTS.GET_STATIC_PAGE_CATEGORY
      );

      return response.data.map(dto => StaticMapper.toViewCategory(dto));
    } catch (error) {
      logger.error('[StaticService] Get static page categories failed:', error);
      return [];
    }
  }

  async getFAQ(filters: FAQFilters = {}): Promise<FAQViewModel[]> {
    try {
      const params: Record<string, unknown> = {
        FAQCategoryId: filters.categoryId || '',
        QorA: filters.qorA || '',
      };

      const response = await this.httpClient.get<FAQApiDto[]>(
        STATIC_ENDPOINTS.GET_FAQ,
        { params }
      );

      return response.data.map(dto => StaticMapper.toViewFAQ(dto));
    } catch (error) {
      logger.error('[StaticService] Get FAQ failed:', error);
      return [];
    }
  }

  async getContactUsSubjects(): Promise<ContactUsSubjectViewModel[]> {
    try {
      const response = await this.httpClient.get<ContactUsSubjectApiDto[]>(
        STATIC_ENDPOINTS.GET_CONTACT_US_SUBJECTS
      );

      return response.data.map(dto => StaticMapper.toViewContactSubject(dto));
    } catch (error) {
      logger.error('[StaticService] Get contact us subjects failed:', error);
      return [];
    }
  }

  async submitContactUs(request: ContactUsRequest): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('SubjectId', request.subjectId);
      formData.append('Fullname', request.fullname);
      formData.append('Description', request.description);
      formData.append('PhoneNumber', request.phoneNumber);
      if (request.email) {
        formData.append('Email', request.email);
      }
      if (request.attachments) {
        request.attachments.forEach(file => {
          formData.append('Attachments', file);
        });
      }

      await this.httpClient.post(STATIC_ENDPOINTS.POST_CONTACT_US, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      logger.error('[StaticService] Submit contact us failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getToolTip(key: string): Promise<ToolTipViewModel | null> {
    try {
      const response = await this.httpClient.get<ToolTipApiDto>(
        STATIC_ENDPOINTS.GET_TOOL_TIP,
        { params: { Key: key } }
      );

      return StaticMapper.toViewToolTip(response.data);
    } catch (error) {
      logger.error('[StaticService] Get tool tip failed:', error);
      return null;
    }
  }

  async getMarketMessage(params: {
    pageUrl?: string;
    pageName?: string;
    description?: string;
  }): Promise<MarketMessageViewModel | null> {
    try {
      const response = await this.httpClient.get<MarketMessageApiDto>(
        STATIC_ENDPOINTS.GET_MARKET_MESSAGE,
        { params }
      );

      return StaticMapper.toViewMarketMessage(response.data);
    } catch (error) {
      logger.error('[StaticService] Get market message failed:', error);
      return null;
    }
  }

  async subscribeNewsletter(request: NewsletterRequest): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('Email', request.email);

      await this.httpClient.post(STATIC_ENDPOINTS.POST_NEWSLETTER, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      logger.error('[StaticService] Subscribe newsletter failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getCurrentTime(): Promise<Date> {
    try {
      const response = await this.httpClient.get<{ currentTime: string }>(
        STATIC_ENDPOINTS.GET_CURRENT_TIME
      );
      return new Date(response.data.currentTime);
    } catch (error) {
      logger.error('[StaticService] Get current time failed:', error);
      return new Date();
    }
  }
}

let staticServiceInstance: StaticService | null = null;

export function getStaticService(): StaticService {
  if (!staticServiceInstance) {
    staticServiceInstance = new StaticService();
  }
  return staticServiceInstance;
}