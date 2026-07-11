// src/core/http/server-http.ts

import { headers } from 'next/headers';
import { getHttpClient } from './client';

export function getServerHttpClient() {
  const client = getHttpClient();
  
  // گرفتن هدرهای درخواست فعلی در سمت سرور (Next.js)
  const headersList = headers();
  
  // استخراج کوکی‌ها
  const cookie = headersList.get('cookie') || '';
  
  // تزریق کوکی‌ها به HttpClient
  client.setServerConfig({
    headers: {
      Cookie: cookie,
    },
  });

  return client;
}