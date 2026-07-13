import { z } from 'zod';

export abstract class BaseValidator<T> {
  public abstract getSchema(): z.ZodSchema<T>;

  validate(data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
    try {
      const result = this.getSchema().parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error };
      }
      throw error;
    }
  }

  parse(data: unknown): T {
    return this.getSchema().parse(data);
  }

  safeParse(data: unknown): z.SafeParseReturnType<unknown, T> {
    return this.getSchema().safeParse(data);
  }

  protected required(message?: string): z.ZodString {
    return z.string().min(1, message || 'این فیلد الزامی است');
  }

  protected optional(): z.ZodOptional<z.ZodString> {
    return z.string().optional();
  }

  protected email(message?: string): z.ZodString {
    return z.string().email(message || 'ایمیل نامعتبر است');
  }

  protected phoneNumber(message?: string): z.ZodString {
    return z.string().regex(/^09[0-9]{9}$/, message || 'شماره موبایل نامعتبر است');
  }

  protected nationalCode(message?: string): z.ZodEffects<z.ZodString, string, string> {
    return z.string()
      .regex(/^[0-9]{10}$/, message || 'کد ملی نامعتبر است')
      .refine((code) => this.validateNationalCode(code), {
        message: message || 'کد ملی نامعتبر است',
      });
  }

  protected postalCode(message?: string): z.ZodString {
    return z.string().regex(/^[0-9]{10}$/, message || 'کد پستی نامعتبر است');
  }

  protected price(message?: string): z.ZodNumber {
    return z.number().positive(message || 'قیمت باید مثبت باشد').int(message || 'قیمت باید عدد صحیح باشد');
  }

  protected bankCardNumber(message?: string): z.ZodEffects<z.ZodString, string, string> {
    return z.string()
      .length(16, message || 'شماره کارت باید ۱۶ رقم باشد')
      .regex(/^[0-9]{16}$/, message || 'شماره کارت نامعتبر است')
      .refine((card) => this.validateLuhn(card), {
        message: message || 'شماره کارت نامعتبر است',
      });
  }

  private validateNationalCode(code: string): boolean {
    if (!/^[0-9]{10}$/.test(code)) return false;
    
    const digits = code.split('').map(Number);
    const checkDigit = digits[9];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    
    const remainder = sum % 11;
    return remainder < 2 ? checkDigit === remainder : checkDigit === (11 - remainder);
  }

  private validateLuhn(cardNumber: string): boolean {
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  }
}