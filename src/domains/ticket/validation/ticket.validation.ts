import { z } from 'zod';
import { BaseValidator } from '@/core/validation/base.validator';
import { CreateTicketRequest, CreateMessageRequest } from '../types/view.types';

export class CreateTicketValidator extends BaseValidator<CreateTicketRequest> {
  public getSchema(): z.ZodSchema<CreateTicketRequest> {
    return z.object({
      categoryId: z.string().uuid('شناسه دسته‌بندی تیکت نامعتبر است'),
      title: z.string()
        .min(4, 'موضوع تیکت باید حداقل ۴ کاراکتر باشد')
        .max(100, 'موضوع تیکت نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد'),
      text: z.string()
        .min(10, 'متن پیام پشتیبانی باید حداقل ۱۰ کاراکتر باشد')
        .max(2000, 'متن پیام پشتیبانی نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد'),
      orderNumber: z.number().int().positive('شماره سفارش باید عدد مثبت معتبر باشد').optional(),
      attachments: z.array(z.any()).optional()
    });
  }
}

export class CreateMessageValidator extends BaseValidator<CreateMessageRequest> {
  public getSchema(): z.ZodSchema<CreateMessageRequest> {
    return z.object({
      text: z.string()
        .min(2, 'متن پیام پاسخ باید حداقل ۲ کاراکتر باشد')
        .max(2000, 'متن پیام پاسخ نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد'),
      ticketId: z.string().uuid('شناسه تیکت نامعتبر است'),
      wasHelpful: z.boolean().optional(),
      attachments: z.array(z.any()).optional()
    });
  }
}

export const ticketValidators = {
  createTicket: new CreateTicketValidator(),
  createMessage: new CreateMessageValidator()
} as const;