import { z } from 'zod';
import { BaseValidator } from '@/core/validation/base.validator';
import { constants } from '@/core/config/constants';

export interface LoginRequest {
  phoneNumber: string;
}

export interface ConfirmLoginRequest {
  phoneNumber: string;
  code: string;
}

export class LoginValidator extends BaseValidator<LoginRequest> {
  public getSchema(): z.ZodSchema<LoginRequest> {
    return z.object({
      phoneNumber: z.string()
        .regex(constants.patterns.PHONE_NUMBER, 'شماره موبایل نامعتبر است')
        .min(11, 'شماره موبایل باید ۱۱ رقم باشد')
        .max(11, 'شماره موبایل باید ۱۱ رقم باشد'),
    });
  }
}

export class ConfirmLoginValidator extends BaseValidator<ConfirmLoginRequest> {
  public getSchema(): z.ZodSchema<ConfirmLoginRequest> {
    return z.object({
      phoneNumber: z.string()
        .regex(constants.patterns.PHONE_NUMBER, 'شماره موبایل نامعتبر است')
        .min(11, 'شماره موبایل باید ۱۱ رقم باشد')
        .max(11, 'شماره موبایل باید ۱۱ رقم باشد'),
      
      code: z.string()
        .length(5, 'کد تایید باید ۵ رقم باشد')
        .regex(/^[0-9]{5}$/, 'کد تایید فقط شامل اعداد است'),
    });
  }
}

export const authValidators = {
  login: new LoginValidator(),
  confirmLogin: new ConfirmLoginValidator(),
} as const;