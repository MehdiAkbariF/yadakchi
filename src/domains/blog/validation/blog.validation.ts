// src/domains/blog/validation/blog.validation.ts

import { z } from 'zod';
import { BaseValidator } from '@/core/validation/base.validator';
import { CreateBlogPostCommentRequest } from '../types/view.types';

export class CreateBlogPostCommentValidator extends BaseValidator<CreateBlogPostCommentRequest> {
  public getSchema(): z.ZodSchema<CreateBlogPostCommentRequest> {
    return z.object({
      blogPostId: z.string().min(1, 'شناسه مقاله الزامی است'),
      comment: z.string()
        .min(5, 'متن دیدگاه باید حداقل ۵ کاراکتر باشد')
        .max(1000, 'متن دیدگاه نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد'),
      isIncognito: z.boolean(),
    });
  }
}

export const blogValidators = {
  createComment: new CreateBlogPostCommentValidator(),
} as const;