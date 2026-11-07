// src/domains/auth/hooks/auth.hooks.ts

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/query-keys';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getAuthService } from '../services/auth.service';
import { LoginRequest, ConfirmLoginRequest } from '../validation/auth.validation';

const authService = getAuthService();

export function useRequestLogin() {
  return useTypedMutation(
    (credentials: LoginRequest) => authService.requestLogin(credentials)
  );
}

export function useConfirmLogin() {
  const queryClient = useQueryClient();

  return useTypedMutation(
    (credentials: ConfirmLoginRequest) => authService.confirmLogin(credentials),
    {
      onSuccess: (user) => {
        queryClient.setQueryData(queryKeys.auth.user, user);
      },
    }
  );
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useTypedMutation<void, void>(
    () => authService.logout(),
    {
      onSettled: () => {
        // ۱. پاکسازی کامل تمام کش‌های ری‌اکت کوئری
        queryClient.setQueryData(queryKeys.auth.user, null);
        queryClient.removeQueries({
          queryKey: queryKeys.auth.user,
        });
        queryClient.clear();

        // ۲. ریدایرکت سخت کلاینت (تخلیه Router Cache نکس و اجرای مجدد لایوت سرور)
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          const isProtected = pathname.startsWith('/profile') || pathname.startsWith('/checkout');

          if (isProtected) {
            window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
          } else {
            // در صفحات عمومی صفحه مجدداً لود می‌شود تا وضعیت هدر به‌روزرسانی شود
            window.location.reload();
          }
        }
      },
    }
  );
}

export function useCurrentUser() {
  return useTypedQuery(
    queryKeys.auth.user,
    () => authService.getCurrentUser(),
    {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
          return false;
        }
        return failureCount < 1;
      },
    }
  );
}

export function useIsAuthenticated() {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    user,
    isLoading,
  };
}

export function useAuth() {
  const { data: user, isLoading, error } = useCurrentUser();
  const logoutMutation = useLogout();

  return {
    user: user || null,
    isLoading,
    error,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}