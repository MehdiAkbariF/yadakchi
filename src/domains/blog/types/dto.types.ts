// src/domains/blog/types/dto.types.ts

export interface BlogCategoryDto {
  id: string;
  title: string;
  iconUrl: string | null;
}

export interface BlogCarTypeDto {
  id: string;
  name: string;
}

export interface BlogPartDto {
  id: string;
  name: string;
  englishTitle: string | null;
  yadakchiProfitPercent: number;
}

export interface BlogPostFiltersResponseDto {
  carTypes: BlogCarTypeDto[];
  parts: BlogPartDto[];
}

export interface BlogAuthorDto {
  id: string | null;
  fullName: string;
  phoneNumber?: string;
  userStatus?: string;
  restrictionStatus?: string;
}

export interface BlogPostListItemDto {
  id: string;
  title: string;
  englishTitle: string;
  imageUrl: string | null;
  imageAlt: string | null;
  readTime: number;
  author: BlogAuthorDto;
  blogCategory: BlogCategoryDto | null;
  carTypes: BlogCarTypeDto[];
  parts: BlogPartDto[];
}

export interface BlogPostsResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: BlogPostListItemDto[];
}

export interface BlogFaqDto {
  id: string;
  blogPostId: string;
  question: string;
  answer: string;
}

export interface BlogSeoInfoDto {
  id: string;
  title: string;
  description: string;
  canonicalUrl: string;
}

export interface BlogPostDetailDto {
  id: string;
  blogCategoryId: string | null;
  status: string;
  title: string;
  englishTitle: string;
  description: string;
  summarry: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  readTime: number;
  creator: BlogAuthorDto | null;
  blogCategory: BlogCategoryDto | null;
  faQs: BlogFaqDto[];
  carTypes: BlogCarTypeDto[];
  parts: BlogPartDto[];
  seoInformation: BlogSeoInfoDto | null;
}

export interface BlogPostCommentDto {
  id: string;
  blogPostId: string;
  comment: string;
  creatorName?: string;
  createDate?: string;
  likes?: number;
  dislikes?: number;
}

export interface BlogPostCommentsResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: BlogPostCommentDto[];
}