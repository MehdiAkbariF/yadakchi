// src/domains/front/basket/validation/basket.validation.ts

import { z } from 'zod';
import { BaseValidator } from '@/core/validation/base.validator';
import { AddToBasketRequest, DeleteFromBasketRequest } from '../types/view.types';

export class AddToBasketValidator extends BaseValidator<AddToBasketRequest> {
  protected getSchema(): z.ZodSchema<AddToBasketRequest> {
    return z.object({
      shopProductId: z.string().min(1, 'شناسه محصول الزامی است'),
      quantity: z.number()
        .int('تعداد باید عدد صحیح باشد')
        .positive('تعداد باید بیشتر از صفر باشد')
        .max(100, 'تعداد نمی‌تواند بیشتر از ۱۰۰ باشد'),
    });
  }
}

export class DeleteFromBasketValidator extends BaseValidator<DeleteFromBasketRequest> {
  protected getSchema(): z.ZodSchema<DeleteFromBasketRequest> {
    return z.object({
      shopProductId: z.string().min(1, 'شناسه محصول الزامی است'),
      quantity: z.number()
        .int('تعداد باید عدد صحیح باشد')
        .positive('تعداد باید بیشتر از صفر باشد')
        .max(100, 'تعداد نمی‌تواند بیشتر از ۱۰۰ باشد'),
    });
  }
}

export const basketValidators = {
  add: new AddToBasketValidator(),
  delete: new DeleteFromBasketValidator(),
} as const;