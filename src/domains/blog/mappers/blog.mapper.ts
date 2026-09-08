// src/domains/blog/mappers/blog.mapper.ts

import { 
  BlogCategoryDto, 
  BlogPostListItemDto, 
  BlogPostDetailDto,
  BlogPostCommentDto,
  UserBlogPostCommentDto,
  CreateBlogPostCommentRequestDto
} from '../types/dto.types';
import { 
  BlogCategory, 
  BlogPostItem, 
  BlogPostDetail 
} from '../types/domain.types';
import { 
  BlogPostCommentViewModel, 
  UserBlogPostCommentViewModel,
  CreateBlogPostCommentRequest 
} from '../types/view.types';

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

  static toViewComment(dto: BlogPostCommentDto): BlogPostCommentViewModel {
    const rawDate = dto.createDate || dto.createdAt || new Date().toISOString();
    return {
      id: dto.id,
      blogPostId: dto.blogPostId,
      comment: dto.comment,
      creatorName: dto.isIncognito ? 'کاربر ناشناس' : (dto.creatorName || dto.creator || 'کاربر یدک‌چی'),
      createDateFormatted: new Date(rawDate).toLocaleDateString('fa-IR'),
      isIncognito: !!dto.isIncognito,
      likes: dto.likes || 0,
      dislikes: dto.dislikes || 0,
    };
  }

  static toViewUserComment(dto: UserBlogPostCommentDto): UserBlogPostCommentViewModel {
    return {
      id: dto.id,
      blogPostId: dto.blogPostId,
      blogPostTitle: dto.blogPostTitle || 'مقاله وبلاگ',
      blogPostEnglishTitle: dto.blogPostEnglishTitle || '',
      blogPostImage: dto.blogPostImage || null,
      comment: dto.comment,
      isConfirmed: dto.isConfirmed !== undefined ? dto.isConfirmed : true,
      isIncognito: !!dto.isIncognito,
      createDateFormatted: new Date(dto.createDate).toLocaleDateString('fa-IR'),
    };
  }

  static toCreateCommentDto(request: CreateBlogPostCommentRequest): CreateBlogPostCommentRequestDto {
    return {
      blogPostId: request.blogPostId,
      comment: request.comment,
      isIncognito: request.isIncognito,
    };
  }
}