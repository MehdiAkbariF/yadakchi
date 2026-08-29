// src/domains/blog/endpoints/blog.endpoints.ts

export const BLOG_ENDPOINTS = {
  GET_CATEGORIES: '/api/Blog/BlogCategories',
  GET_FILTERS: '/api/Blog/BlogPostFilters',
  GET_POSTS: '/api/Blog/BlogPosts',
  GET_POST_DETAIL: '/api/Blog/BlogPost',
  GET_COMMENTS: '/api/Blog/BlogPostComments',
} as const;