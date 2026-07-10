// src/domains/front/comment/types/view.types.ts

export interface CommentViewModel {
  id: string;
  productId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    isIncognito: boolean;
    displayName: string;
  };
  rate: number;
  rateStars: number;
  content: string;
  likes: {
    likes: number;
    dislikes: number;
    isLikedByUser: boolean;
  };
  parentId: string | null;
  replyCount: number;
  replyCountText: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    timeAgo: string;
  };
}

export interface CommentAverageViewModel {
  averageRate: number;
  totalComments: number;
  rateDistribution: {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
  ratePercentage: {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
}

export interface CreateCommentRequest {
  productId: string;
  comment: string;
  rate: number;
  isIncognito: boolean;
}

export interface UpdateCommentRequest {
  id: string;
  rate: number;
}

export interface LikeCommentRequest {
  productCommentId: string;
  likeStatus: 'Like' | 'Dislike';
}

export interface CommentFilters {
  productId: string;
  orderBy?: 'Newest' | 'Oldest' | 'MostLike' | 'LeastLike';
  pageNumber?: number;
  pageSize?: number;
}