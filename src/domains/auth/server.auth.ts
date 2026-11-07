// src/domains/auth/server.auth.ts

import { cookies } from 'next/headers';
import { getAuthService } from './services/auth.service';

/**
 * دریافت اطلاعات کاربر احراز هویت شده در Server Components (سازگار کامل با Next.js 15)
 * این متد کوکی‌های ارسالی از کلاینت (از جمله کوکی‌های HttpOnly) را بدون دستکاری به بک‌اند فوروارد می‌کند.
 */
export async function getServerCurrentUser() {
  try {
    // در Next.js 15 متد cookies حتماً باید await شود
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // اگر هیچ کوکی ارسال نشده باشد، یعنی کاربر مهمان است
    if (!cookieHeader) {
      return null;
    }

    // ارسال هدر Cookie حاوی توکن‌های HttpOnly به اندپوینت /api/Login/User سرور
    return await getAuthService().getCurrentUser({ cookie: cookieHeader });
  } catch (error) {
    return null;
  }
}