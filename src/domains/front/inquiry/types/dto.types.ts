// src/domains/front/inquiry/types/dto.types.ts

export interface InquiryApiDto {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  likes: number;
  dislikes: number;
  isLikedByUser?: boolean;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryReplyApiDto {
  id: string;
  inquiryId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  likes: number;
  dislikes: number;
  isLikedByUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryRequestDto {
  productId: string;
  comment: string;
}

export interface LikeInquiryRequestDto {
  productInquiryId: string;
  likeStatus: 'Like' | 'Dislike';
}