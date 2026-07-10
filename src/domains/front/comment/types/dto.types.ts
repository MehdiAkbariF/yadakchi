// src/domains/front/comment/types/dto.types.ts

export interface CommentApiDto {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isIncognito: boolean;
  rate: number;
  comment: string;
  likes: number;
  dislikes: number;
  isLikedByUser?: boolean;
  parentId?: string;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentReplyApiDto {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isIncognito: boolean;
  comment: string;
  likes: number;
  dislikes: number;
  isLikedByUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentAverageApiDto {
  averageRate: number;
  totalComments: number;
  rateDistribution: {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
}

export interface CreateCommentRequestDto {
  productId: string;
  comment: string;
  rate: number;
  isIncognito: boolean;
}

export interface UpdateCommentRequestDto {
  id: string;
  rate: number;
}

export interface LikeCommentRequestDto {
  productCommentId: string;
  likeStatus: 'Like' | 'Dislike';
}