// src/domains/auth/types/auth.types.ts

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  nationalCode?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  roles: UserRole[];
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export type UserRole = 'USER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';

export type Permission = 
  | 'view_products'
  | 'create_products'
  | 'edit_products'
  | 'delete_products'
  | 'view_orders'
  | 'create_orders'
  | 'edit_orders'
  | 'delete_orders'
  | 'view_users'
  | 'edit_users'
  | 'delete_users'
  | 'view_reports'
  | 'manage_roles';

export interface AuthSession {
  user: User;
  isAuthenticated: boolean;
  expiresAt: Date;
}

export interface LoginCredentials {
  phoneNumber: string;
}

export interface ConfirmLoginCredentials {
  phoneNumber: string;
  code: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}