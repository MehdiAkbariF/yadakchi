// src/domains/front/inquiry/mappers/inquiry.mapper.ts

import { 
  InquiryApiDto, 
  CreateInquiryRequestDto,
  LikeInquiryRequestDto
} from '../types/dto.types';
import { 
  Inquiry, 

} from '../types/domain.types';
import { 
  InquiryViewModel, 
  CreateInquiryRequest,
  LikeInquiryRequest
} from '../types/view.types';

export class InquiryMapper {
  static toDomain(dto: InquiryApiDto): Inquiry {
    return {
      id: dto.id,
      productId: dto.productId,
      user: {
        id: dto.userId,
        name: dto.userName,
        avatar: dto.userAvatar,
      },
      content: dto.comment,
      likes: {
        likes: dto.likes,
        dislikes: dto.dislikes,
        isLikedByUser: dto.isLikedByUser,
      },
      replyCount: dto.replyCount,
      metadata: {
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
      },
    };
  }

  static toView(domain: Inquiry): InquiryViewModel {
    return {
      id: domain.id,
      productId: domain.productId,
      user: {
        id: domain.user.id,
        name: domain.user.name,
        avatar: domain.user.avatar || null,
        displayName: domain.user.name,
      },
      content: domain.content,
      likes: {
        likes: domain.likes.likes,
        dislikes: domain.likes.dislikes,
        isLikedByUser: domain.likes.isLikedByUser || false,
      },
      replyCount: domain.replyCount,
      replyCountText: domain.replyCount > 0 
        ? `${domain.replyCount} پاسخ` 
        : '',
      metadata: {
        createdAt: domain.metadata.createdAt.toISOString(),
        updatedAt: domain.metadata.updatedAt.toISOString(),
        timeAgo: this.getTimeAgo(domain.metadata.createdAt),
      },
    };
  }

  static toCreateRequest(request: CreateInquiryRequest): CreateInquiryRequestDto {
    return {
      productId: request.productId,
      comment: request.comment,
    };
  }

  static toLikeRequest(request: LikeInquiryRequest): LikeInquiryRequestDto {
    return {
      productInquiryId: request.productInquiryId,
      likeStatus: request.likeStatus,
    };
  }

  private static getTimeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} سال پیش`;
    if (months > 0) return `${months} ماه پیش`;
    if (days > 0) return `${days} روز پیش`;
    if (hours > 0) return `${hours} ساعت پیش`;
    if (minutes > 0) return `${minutes} دقیقه پیش`;
    return 'چند لحظه پیش';
  }
}