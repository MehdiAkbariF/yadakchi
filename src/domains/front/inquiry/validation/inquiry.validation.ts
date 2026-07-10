// src/domains/front/inquiry/validation/inquiry.validation.ts

import { z } from 'zod';
import { BaseValidator } from '@/core/validation/base.validator';
import { CreateInquiryRequest, LikeInquiryRequest } from '../types/view.types';

export class CreateInquiryValidator extends BaseValidator<CreateInquiryRequest> {
  protected getSchema(): z.ZodSchema<CreateInquiryRequest> {
    return z.object({
      productId: z.string().min(1, 'شناسه محصول الزامی است'),
      comment: z.string()
        .min(5, 'پرسش حداقل ۵ کاراکتر باید باشد')
        .max(500, 'پرسش حداکثر ۵۰۰ کاراکتر باید باشد'),
    }) as z.ZodType<CreateInquiryRequest>;
  }
}

export class LikeInquiryValidator extends BaseValidator<LikeInquiryRequest> {
  protected getSchema(): z.ZodSchema<LikeInquiryRequest> {
    return z.object({
      productInquiryId: z.string().min(1, 'شناسه پرسش الزامی است'),
      likeStatus: z.enum(['Like', 'Dislike']),
    }) as z.ZodType<LikeInquiryRequest>;
  }
}

export const inquiryValidators = {
  create: new CreateInquiryValidator(),
  like: new LikeInquiryValidator(),
} as const;