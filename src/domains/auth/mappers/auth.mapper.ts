// src/domains/auth/mappers/auth.mapper.ts

import { User, UserRole, Permission } from '../types/auth.types';
import { AuthResponseDto } from '../types/dto.types';

export class AuthMapper {
  static toDomain(dto: AuthResponseDto): User {
    return {
      id: dto.id,
      phoneNumber: dto.phoneNumber,
      fullName: dto.fullName,
      email: dto.email,
      nationalCode: dto.nationalCode,
      isPhoneVerified: dto.isPhoneVerified,
      isEmailVerified: dto.isEmailVerified,
      roles: this.mapRoles(dto.roles),
      permissions: this.mapPermissions(dto.permissions),
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : undefined,
    };
  }

  static toDto(domain: Partial<User>): Partial<AuthResponseDto> {
    return {
      id: domain.id,
      phoneNumber: domain.phoneNumber,
      fullName: domain.fullName,
      email: domain.email,
      nationalCode: domain.nationalCode,
      isPhoneVerified: domain.isPhoneVerified,
      isEmailVerified: domain.isEmailVerified,
      roles: domain.roles?.map(r => r.toString()),
      permissions: domain.permissions?.map(p => p.toString()),
      createdAt: domain.createdAt?.toISOString(),
      updatedAt: domain.updatedAt?.toISOString(),
      lastLoginAt: domain.lastLoginAt?.toISOString(),
    };
  }

  private static mapRoles(roles: string[]): UserRole[] {
    return roles.map(role => {
      const mappedRole = role.toUpperCase() as UserRole;
      if (!['USER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(mappedRole)) {
        return 'USER';
      }
      return mappedRole;
    });
  }

  private static mapPermissions(permissions: string[]): Permission[] {
    const validPermissions: Permission[] = [
      'view_products',
      'create_products',
      'edit_products',
      'delete_products',
      'view_orders',
      'create_orders',
      'edit_orders',
      'delete_orders',
      'view_users',
      'edit_users',
      'delete_users',
      'view_reports',
      'manage_roles',
    ];

    return permissions
      .map(p => p as Permission)
      .filter(p => validPermissions.includes(p));
  }

  static isAdmin(user: User): boolean {
    return user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
  }

  static isSeller(user: User): boolean {
    return user.roles.includes('SELLER');
  }

  static hasPermission(user: User, permission: Permission): boolean {
    return user.permissions.includes(permission);
  }
}