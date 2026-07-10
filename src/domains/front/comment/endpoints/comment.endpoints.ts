// src/domains/front/comment/endpoints/comment.endpoints.ts

export const COMMENT_ENDPOINTS = {
  GET_PRODUCT_COMMENTS: '/api/Front/ProductComments',
  GET_COMMENT_REPLIES: '/api/Front/ProductCommentReplies',
  GET_COMMENT_AVERAGE: '/api/Front/ProductCommentsAverageRate',
  
  // User Panel
  GET_PENDING_COMMENTS: '/api/UserPanel/PendingComment',
  GET_USER_COMMENTS: '/api/UserPanel/UserProductComments',
  POST_COMMENT: '/api/UserPanel/ProductComment',
  PUT_COMMENT: '/api/UserPanel/ProductComment',
  DELETE_COMMENT: '/api/UserPanel/ProductComment',
  POST_COMMENT_LIKE: '/api/UserPanel/ProductCommentLike',
  DELETE_COMMENT_LIKE: '/api/UserPanel/ProductCommentLike',
} as const;