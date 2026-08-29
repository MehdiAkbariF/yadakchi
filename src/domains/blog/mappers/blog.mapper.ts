// src/domains/blog/mappers/blog.mapper.ts

import { 
  BlogCategoryDto, 
  BlogPostListItemDto, 
  BlogPostDetailDto 
} from '../types/dto.types';
import { 
  BlogCategory, 
  BlogPostItem, 
  BlogPostDetail 
} from '../types/domain.types';

export class BlogMapper {
  static toDomainCategory(dto: BlogCategoryDto): BlogCategory {
    return {
      id: dto.id,
      title: dto.title,
      iconUrl: dto.iconUrl || null,
    };
  }

  static toDomainPostItem(dto: BlogPostListItemDto): BlogPostItem {
    return {
      id: dto.id,
      title: dto.title,
      englishTitle: dto.englishTitle,
      imageUrl: dto.imageUrl || null,
      imageAlt: dto.imageAlt || dto.title,
      readTime: dto.readTime || 3,
      authorName: dto.author?.fullName || 'تیم تحریریه یدک‌چی',
      category: dto.blogCategory ? this.toDomainCategory(dto.blogCategory) : null,
      carTypes: dto.carTypes || [],
      parts: dto.parts || [],
    };
  }

  static toDomainPostDetail(dto: BlogPostDetailDto): BlogPostDetail {
    return {
      id: dto.id,
      title: dto.title,
      englishTitle: dto.englishTitle,
      description: dto.description || '',
      summary: dto.summarry || null,
      imageUrl: dto.imageUrl || null,
      imageAlt: dto.imageAlt || dto.title,
      readTime: dto.readTime || 3,
      author: {
        id: dto.creator?.id || null,
        fullName: dto.creator?.fullName || 'تیم تحریریه یدک‌چی',
        phoneNumber: dto.creator?.phoneNumber,
      },
      category: dto.blogCategory ? this.toDomainCategory(dto.blogCategory) : null,
      faqs: dto.faQs || [],
      carTypes: dto.carTypes || [],
      parts: dto.parts || [],
      seo: dto.seoInformation ? {
        title: dto.seoInformation.title,
        description: dto.seoInformation.description,
        canonicalUrl: dto.seoInformation.canonicalUrl,
      } : null,
    };
  }
}