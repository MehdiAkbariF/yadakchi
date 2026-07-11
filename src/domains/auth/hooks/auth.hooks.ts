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
        // تنظیم مستقیم و آنی پروفایل کاربر در سیستم مدیریت وضعیت (کش ری‌اکت کوئری)
        queryClient.setQueryData(queryKeys.auth.user, user);
        
        // توجه: از فراخوانی invalidateQueries در اینجا خودداری می‌کنیم تا از بروز باگ همگام‌سازی کوکی (Race Condition)
        // و بازخوانی فوری اطلاعات از سرور که منجر به خطای ۴۰۱ ناخواسته می‌شد، جلوگیری کنیم.
      },
    }
  );
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useTypedMutation(
    () => authService.logout(),
    {
      onSuccess: () => {
        // پاک‌سازی کامل کش هویتی کاربر در هنگام خروج
        queryClient.setQueryData(queryKeys.auth.user, null);
        queryClient.removeQueries({
          queryKey: queryKeys.auth.user,
        });
        queryClient.clear();
      },
    }
  );
}

export function useCurrentUser() {
  return useTypedQuery(
    queryKeys.auth.user,
    () => authService.getCurrentUser(),
    {
      staleTime: 5 * 60 * 1000, // ۵ دقیقه ماندگاری کش پروفایل کاربری
      retry: (failureCount, error) => {
        // در صورت خطای ۴۰۱ از تکرار مجدد درخواست خودداری کن
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