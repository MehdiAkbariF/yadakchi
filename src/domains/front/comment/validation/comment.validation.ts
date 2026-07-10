// src/domains/front/comment/validation/comment.validation.ts

import { z } from 'zod';
import { BaseValidator } from '@/core/validation/base.validator';
import { CreateCommentRequest, UpdateCommentRequest, LikeCommentRequest } from '../types/view.types';

export class CreateCommentValidator extends BaseValidator<CreateCommentRequest> {
  protected getSchema(): z.ZodSchema<CreateCommentRequest> {
    return z.object({
      productId: z.string().min(1, 'شناسه محصول الزامی است'),
      comment: z.string()
        .min(10, 'نظر حداقل ۱۰ کاراکتر باید باشد')
        .max(1000, 'نظر حداکثر ۱۰۰۰ کاراکتر باید باشد'),
      rate: z.number()
        .int()
        .min(1, 'امتیاز باید بین ۱ تا ۵ باشد')
        .max(5, 'امتیاز باید بین ۱ تا ۵ باشد'),
      isIncognito: z.boolean().default(false),
    }) as z.ZodType<CreateCommentRequest>;
  }
}

export class UpdateCommentValidator extends BaseValidator<UpdateCommentRequest> {
  protected getSchema(): z.ZodSchema<UpdateCommentRequest> {
    return z.object({
      id: z.string().min(1, 'شناسه نظر الزامی است'),
      rate: z.number()
        .int()
        .min(1, 'امتیاز باید بین ۱ تا ۵ باشد')
        .max(5, 'امتیاز باید بین ۱ تا ۵ باشد'),
    }) as z.ZodType<UpdateCommentRequest>;
  }
}

export class LikeCommentValidator extends BaseValidator<LikeCommentRequest> {
  protected getSchema(): z.ZodSchema<LikeCommentRequest> {
    return z.object({
      productCommentId: z.string().min(1, 'شناسه نظر الزامی است'),
      likeStatus: z.enum(['Like', 'Dislike']),
    }) as z.ZodType<LikeCommentRequest>;
  }
}

export const commentValidators = {
  create: new CreateCommentValidator(),
  update: new UpdateCommentValidator(),
  like: new LikeCommentValidator(),
} as const;