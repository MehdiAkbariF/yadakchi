// src/domains/front/static/mappers/static.mapper.ts

import { 
  StaticPageApiDto, 
  StaticPageCategoryApiDto,
  FAQApiDto,
  ContactUsSubjectApiDto,
  ContactUsRequestDto,
  ToolTipApiDto,
  MarketMessageApiDto,
  NewsletterRequestDto
} from '../types/dto.types';
import { StaticPage } from '../types/domain.types';
import { 
  StaticPageViewModel, 
  StaticPageCategoryViewModel,
  StaticPageItemViewModel,
  FAQViewModel,
  ContactUsSubjectViewModel,
  ContactUsRequest,
  ToolTipViewModel,
  MarketMessageViewModel,
  NewsletterRequest
} from '../types/view.types';

export class StaticMapper {
  /**
   * تبدیل DTO صفحه استاتیک به Domain
   * ساختار واقعی API:
   * {
   *   id, title, englishTitle, url, content, seoInformation
   * }
   */
  static toDomainPage(dto: StaticPageApiDto): StaticPage {
    return {
      id: dto.id,
      title: dto.title,
      englishTitle: dto.englishTitle,
      url: dto.url,
      content: dto.content || '',
      seo: dto.seoInformation ? {
        metaTitle: dto.seoInformation.title,
        metaDescription: dto.seoInformation.description,
        metaKeywords: dto.seoInformation.keywords || '',
        canonicalUrl: dto.seoInformation.canonicalUrl || '',
      } : null,
    };
  }

  /**
   * تبدیل Domain به ViewModel
   * نکته: چون seoInformation در پاسخ API ممکنه null باشه، fallback میدیم
   */
  static toViewPage(domain: StaticPage): StaticPageViewModel {
    return {
      id: domain.id,
      title: domain.title,
      englishTitle: domain.englishTitle,
      url: domain.url,
      content: domain.content,
      seo: {
        metaTitle: domain.seo?.metaTitle || null,
        metaDescription: domain.seo?.metaDescription || null,
        metaKeywords: domain.seo?.metaKeywords || null,
        canonicalUrl: domain.seo?.canonicalUrl || null,
      },
    };
  }

  /**
   * تبدیل DTO دسته‌بندی به ViewModel
   * ساختار واقعی API:
   * [{ title, staticPages: [{ id, title, englishTitle, url }] }]
   */
  static toViewCategory(dto: any): StaticPageCategoryViewModel {
    return {
      title: dto.title || '',
      staticPages: (dto.staticPages || []).map((page: any): StaticPageItemViewModel => ({
        id: page.id || '',
        title: page.title || '',
        englishTitle: page.englishTitle || '',
        url: page.url || '',
      })),
    };
  }

  // ============================================
  // FAQ
  // ============================================
  static toViewFAQ(dto: FAQApiDto): FAQViewModel {
    return {
      id: dto.id,
      question: dto.question,
      answer: dto.answer,
      category: {
        id: dto.categoryId,
        name: dto.categoryName,
      },
      order: dto.order,
    };
  }

  // ============================================
  // Contact Us
  // ============================================
  static toViewContactSubject(dto: ContactUsSubjectApiDto): ContactUsSubjectViewModel {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description || null,
      order: dto.order,
    };
  }

  static toContactRequest(request: ContactUsRequest): ContactUsRequestDto {
    return {
      subjectId: request.subjectId,
      fullname: request.fullname,
      description: request.description,
      phoneNumber: request.phoneNumber,
      email: request.email,
      attachments: request.attachments?.map(f => f.name),
    };
  }

  // ============================================
  // ToolTip
  // ============================================
  static toViewToolTip(dto: ToolTipApiDto): ToolTipViewModel {
    return {
      id: dto.id,
      key: dto.key,
      title: dto.title,
      content: dto.content,
    };
  }

  // ============================================
  // Market Message
  // ============================================
  static toViewMarketMessage(dto: MarketMessageApiDto): MarketMessageViewModel {
    return {
      id: dto.id,
      pageUrl: dto.pageUrl,
      pageName: dto.pageName,
      message: dto.message,
    };
  }

  // ============================================
  // Newsletter
  // ============================================
  static toNewsletterRequest(request: NewsletterRequest): NewsletterRequestDto {
    return {
      email: request.email,
    };
  }
}