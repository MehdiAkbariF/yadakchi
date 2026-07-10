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
import { 
  StaticPage, 

} from '../types/domain.types';
import { 
  StaticPageViewModel, 
  StaticPageCategoryViewModel,
  FAQViewModel,
  ContactUsSubjectViewModel,
  ContactUsRequest,
  ToolTipViewModel,
  MarketMessageViewModel,
  NewsletterRequest
} from '../types/view.types';

export class StaticMapper {
  static toDomainPage(dto: StaticPageApiDto): StaticPage {
    return {
      id: dto.id,
      title: dto.title,
      content: dto.content,
      category: {
        id: dto.categoryId,
        name: dto.categoryName,
        description: '',
        order: 0,
        isActive: true,
      },
      slug: dto.slug,
      seo: {
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
      },
      isActive: dto.isActive,
      metadata: {
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
      },
    };
  }

  static toViewPage(domain: StaticPage): StaticPageViewModel {
    return {
      id: domain.id,
      title: domain.title,
      content: domain.content,
      category: {
        id: domain.category.id,
        name: domain.category.name,
      },
      slug: domain.slug,
      seo: {
        metaTitle: domain.seo.metaTitle || null,
        metaDescription: domain.seo.metaDescription || null,
        metaKeywords: domain.seo.metaKeywords || null,
      },
      metadata: {
        createdAt: domain.metadata.createdAt.toISOString(),
        updatedAt: domain.metadata.updatedAt.toISOString(),
      },
    };
  }

  static toViewCategory(dto: StaticPageCategoryApiDto): StaticPageCategoryViewModel {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description || null,
      order: dto.order,
    };
  }

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

  static toViewToolTip(dto: ToolTipApiDto): ToolTipViewModel {
    return {
      id: dto.id,
      key: dto.key,
      title: dto.title,
      content: dto.content,
    };
  }

  static toViewMarketMessage(dto: MarketMessageApiDto): MarketMessageViewModel {
    return {
      id: dto.id,
      pageUrl: dto.pageUrl,
      pageName: dto.pageName,
      message: dto.message,
    };
  }

  static toNewsletterRequest(request: NewsletterRequest): NewsletterRequestDto {
    return {
      email: request.email,
    };
  }
}