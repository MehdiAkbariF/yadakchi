// src/domains/auth/hooks/useRequireAuth.ts
'use client';

import * as React from 'react';
import { getHttpClient } from '@/core/http/client';
import { showToast } from '@/core/utils/toast';

export function useRequireAuth() {
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(false);

  const checkAuthAndRun = React.useCallback(
    async (callback: () => void, targetAction?: string) => {
      setIsCheckingAuth(true);
      try {
        const client = getHttpClient();
        await client.get('/api/UserPanel/User');
        callback();
      } catch (error: any) {
        const status =
          error?.status ||
          error?.statusCode ||
          error?.response?.status ||
          error?.response?.data?.status;

        if (status === 401 || status === 403 || String(status) === '401') {
          showToast.error('برای ثبت دیدگاه یا پرسش، ابتدا وارد حساب کاربری خود شوید');

          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (targetAction) {
              url.searchParams.set('action', targetAction);
            }
            const returnUrl = url.pathname + url.search;

            // استفاده از replace به جای href تا صفحه پروداکت با لاگین جایگزین شود نه push
            window.location.replace(`/login?redirect=${encodeURIComponent(returnUrl)}`);
          }
        } else {
          showToast.error(error?.userMessage || 'خطا در برقراری ارتباط با سرور');
        }
      } finally {
        setIsCheckingAuth(false);
      }
    },
    []
  );

  return { checkAuthAndRun, isCheckingAuth };
}