// src/domains/auth/hooks/auth.hooks.ts

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/query-keys';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getAuthService } from '../services/auth.service';
import { LoginRequest, ConfirmLoginRequest } from '../validation/auth.validation';


const authService = getAuthService();

/**
 * Hook برای درخواست کد تایید
 */
export function useRequestLogin() {
  return useTypedMutation(
    (credentials: LoginRequest) => authService.requestLogin(credentials),
    {
      onError: (error) => {
        console.error('Login request failed:', error);
      },
    }
  );
}

/**
 * Hook برای تایید کد و ورود
 */
export function useConfirmLogin() {
  const queryClient = useQueryClient();

  return useTypedMutation(
    (credentials: ConfirmLoginRequest) => authService.confirmLogin(credentials),
    {
      onSuccess: (user) => {
        // ذخیره کاربر در کش
        queryClient.setQueryData(queryKeys.auth.user, user);
        queryClient.invalidateQueries({
          queryKey: queryKeys.auth.user,
        });
      },
    }
  );
}

/**
 * Hook برای خروج از سیستم
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useTypedMutation(
    () => authService.logout(),
    {
      onSuccess: () => {
        // پاک کردن کش کاربر
        queryClient.setQueryData(queryKeys.auth.user, null);
        queryClient.removeQueries({
          queryKey: ['user'],
        });
        // پاک کردن تمام کش
        queryClient.clear();
      },
    }
  );
}

/**
 * Hook برای دریافت اطلاعات کاربر فعلی
 */
export function useCurrentUser() {
  return useTypedQuery(
    queryKeys.auth.user,
    () => authService.getCurrentUser(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // اگر خطای ۴۰۱ باشد، دوباره تلاش نکن
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );
}

/**
 * Hook برای بررسی احراز هویت
 */
export function useIsAuthenticated() {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    user,
    isLoading,
  };
}

/**
 * Hook برای دسترسی به کاربر با context
 */
export function useAuth() {
  const { data: user, isLoading, error } = useCurrentUser();
  const logout = useLogout();

  return {
    user: user || null,
    isLoading,
    error,
    isAuthenticated: !!user,
    logout: logout.mutate,
    isLoggingOut: logout.isPending,
  };
}

/**
 * Hook برای بررسی نقش کاربر
 */
export function useUserRoles() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.roles.includes('ADMIN') || user?.roles.includes('SUPER_ADMIN') || false,
    isSeller: user?.roles.includes('SELLER') || false,
    isUser: user?.roles.includes('USER') || false,
    roles: user?.roles || [],
  };
}

/**
 * Hook برای بررسی دسترسی کاربر
 */
export function usePermission(permission: string) {
  const { user } = useAuth();
  return user?.permissions.includes(permission as any) || false;
}