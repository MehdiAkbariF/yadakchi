// src/domains/front/inquiry/types/domain.types.ts

export interface Inquiry {
  id: string;
  productId: string;
  user: InquiryUser;
  content: string;
  likes: InquiryLikes;
  replyCount: number;
  metadata: InquiryMetadata;
}

export interface InquiryUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface InquiryLikes {
  likes: number;
  dislikes: number;
  isLikedByUser?: boolean;
}

export interface InquiryMetadata {
  createdAt: Date;
  updatedAt: Date;
}