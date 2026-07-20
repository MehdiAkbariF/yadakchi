import { z } from 'zod';
import { BaseValidator } from '@/core/validation/base.validator';

export class CreateBankAccountValidator extends BaseValidator<{ cardNumber: string; shebaNumber: string }> {
  public getSchema(): z.ZodSchema<{ cardNumber: string; shebaNumber: string }> {
    return z.object({
      cardNumber: z.string().length(16, 'شماره کارت باید دقیقا ۱۶ رقم باشد').regex(/^[0-9]+$/, 'شماره کارت فقط شامل اعداد است'),
      shebaNumber: z.string().regex(/^IR[0-9]{22}$/, 'شماره شبا نامعتبر است (باید با IR شروع شود و در مجموع ۲۴ کاراکتر باشد)')
    });
  }
}

export class CreateUserVehicleValidator extends BaseValidator<{ carId: string; title: string; isDefault: boolean }> {
  public getSchema(): z.ZodSchema<{ carId: string; title: string; isDefault: boolean }> {
    return z.object({
      carId: z.string().uuid('شناسه خودرو نامعتبر است'),
      title: z.string().min(2, 'عنوان خودرو باید حداقل ۲ کاراکتر باشد'),
      isDefault: z.boolean()
    });
  }
}

export class UpdateUserVehicleValidator extends BaseValidator<{ id: string; title: string; mileage: number; oilKmLimit: number; lastServiceDate: string; isDefault: boolean }> {
  public getSchema(): z.ZodSchema<{ id: string; title: string; mileage: number; oilKmLimit: number; lastServiceDate: string; isDefault: boolean }> {
    return z.object({
      id: z.string().uuid('شناسه خودرو نامعتبر است'),
      title: z.string().min(2, 'عنوان خودرو باید حداقل ۲ کاراکتر باشد'),
      mileage: z.number().int().nonnegative('کارکرد خودرو باید عدد مثبت یا صفر باشد'),
      oilKmLimit: z.number().int().positive('حد مجاز تعویض روغن باید عدد مثبت باشد'),
      lastServiceDate: z.string().datetime('تاریخ آخرین سرویس معتبر نیست'),
      isDefault: z.boolean()
    });
  }
}

export const userPanelValidators = {
  createBankAccount: new CreateBankAccountValidator(),
  createVehicle: new CreateUserVehicleValidator(),
  updateVehicle: new UpdateUserVehicleValidator()
} as const;