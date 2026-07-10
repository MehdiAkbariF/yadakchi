// src/domains/front/inquiry/types/view.types.ts

export interface InquiryViewModel {
  id: string;
  productId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    displayName: string;
  };
  content: string;
  likes: {
    likes: number;
    dislikes: number;
    isLikedByUser: boolean;
  };
  replyCount: number;
  replyCountText: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    timeAgo: string;
  };
}

export interface CreateInquiryRequest {
  productId: string;
  comment: string;
}

export interface LikeInquiryRequest {
  productInquiryId: string;
  likeStatus: 'Like' | 'Dislike';
}

export interface InquiryFilters {
  productId: string;
  orderBy?: 'Latest' | 'Oldest' | 'MostPopular' | 'MostReplied' | 'LeastReplied';
  pageNumber?: number;
  pageSize?: number;
}