// src/domains/auth/server.auth.ts

import { headers as nextHeaders } from 'next/headers';
import { getAuthService } from './services/auth.service';

// 🚨 این تابع مخصوص سمت سرور (Server Components) است
export async function getServerCurrentUser() {
  const cookieStore = nextHeaders();
  const cookie = cookieStore.get('cookie') || '';
  
  // ارسال کوکی به سرویس برای دریافت اطلاعات کاربر
  return getAuthService().getCurrentUser({ cookie });
}