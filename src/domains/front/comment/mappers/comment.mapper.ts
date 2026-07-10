// src/domains/front/comment/mappers/comment.mapper.ts

import { 
  CommentApiDto, 
  CommentAverageApiDto,
  CreateCommentRequestDto,
  UpdateCommentRequestDto,
  LikeCommentRequestDto
} from '../types/dto.types';
import { 
  Comment,
} from '../types/domain.types';
import { 
  CommentViewModel, 
  CommentAverageViewModel,
  CreateCommentRequest,
  UpdateCommentRequest,
  LikeCommentRequest
} from '../types/view.types';

export class CommentMapper {
  static toDomain(dto: CommentApiDto): Comment {
    return {
      id: dto.id,
      productId: dto.productId,
      user: {
        id: dto.userId,
        name: dto.userName,
        avatar: dto.userAvatar,
        isIncognito: dto.isIncognito,
      },
      rate: dto.rate,
      content: dto.comment,
      likes: {
        likes: dto.likes,
        dislikes: dto.dislikes,
        isLikedByUser: dto.isLikedByUser,
      },
      parentId: dto.parentId,
      replyCount: dto.replyCount,
      metadata: {
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
      },
    };
  }

  static toView(domain: Comment): CommentViewModel {
    const displayName = domain.user.isIncognito 
      ? 'کاربر ناشناس' 
      : domain.user.name;

    return {
      id: domain.id,
      productId: domain.productId,
      user: {
        id: domain.user.id,
        name: domain.user.name,
        avatar: domain.user.avatar || null,
        isIncognito: domain.user.isIncognito,
        displayName,
      },
      rate: domain.rate,
      rateStars: Math.round(domain.rate),
      content: domain.content,
      likes: {
        likes: domain.likes.likes,
        dislikes: domain.likes.dislikes,
        isLikedByUser: domain.likes.isLikedByUser || false,
      },
      parentId: domain.parentId || null,
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

  static toViewAverage(dto: CommentAverageApiDto): CommentAverageViewModel {
    const total = dto.totalComments;
    const distribution = dto.rateDistribution;

    return {
      averageRate: dto.averageRate,
      totalComments: dto.totalComments,
      rateDistribution: distribution,
      ratePercentage: {
        one: total > 0 ? (distribution.one / total) * 100 : 0,
        two: total > 0 ? (distribution.two / total) * 100 : 0,
        three: total > 0 ? (distribution.three / total) * 100 : 0,
        four: total > 0 ? (distribution.four / total) * 100 : 0,
        five: total > 0 ? (distribution.five / total) * 100 : 0,
      },
    };
  }

  static toCreateRequest(request: CreateCommentRequest): CreateCommentRequestDto {
    return {
      productId: request.productId,
      comment: request.comment,
      rate: request.rate,
      isIncognito: request.isIncognito,
    };
  }

  static toUpdateRequest(request: UpdateCommentRequest): UpdateCommentRequestDto {
    return {
      id: request.id,
      rate: request.rate,
    };
  }

  static toLikeRequest(request: LikeCommentRequest): LikeCommentRequestDto {
    return {
      productCommentId: request.productCommentId,
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