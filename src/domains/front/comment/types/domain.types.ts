// src/domains/front/comment/types/domain.types.ts

export interface Comment {
  id: string;
  productId: string;
  user: CommentUser;
  rate: number;
  content: string;
  likes: CommentLikes;
  parentId?: string;
  replyCount: number;
  metadata: CommentMetadata;
}

export interface CommentUser {
  id: string;
  name: string;
  avatar?: string;
  isIncognito: boolean;
}

export interface CommentLikes {
  likes: number;
  dislikes: number;
  isLikedByUser?: boolean;
}

export interface CommentMetadata {
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentAverage {
  averageRate: number;
  totalComments: number;
  rateDistribution: RateDistribution;
}

export interface RateDistribution {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
}