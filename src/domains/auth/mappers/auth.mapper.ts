import { User } from '../types/auth.types';

export class AuthMapper {
  static toDomain(dto: any): User {
    return {
      id: dto.id,
      lastName: dto.lastName || '',
      fullName: dto.fullName || '',
      userName: dto.userName || '',
      status: dto.status || '',
      registerDate: dto.registerDate || '',
      birthDate: dto.birthDate,
      userChosenCity: dto.userChosenCity,
      userChosenCityId: dto.userChosenCityId,
      shopTitle: dto.shopTitle,
      phoneNumber: dto.phoneNumber || '',
      phoneNumberConfirmed: dto.phoneNumberConfirmed || false,
      nationalCode: dto.nationalCode || null,
      email: dto.email || null,
      isEmailConfirmed: dto.isEmailConfirmed || false,
      roles: (dto.roles || []).map((r: any) => ({
        roleName: r.roleName,
        claims: r.claims || [],
      })),
      bankAccounts: (dto.bankAccounts || []).map((b: any) => ({
        id: b.id,
        cardNumber: b.cardNumber || '',
        shebaNumber: b.shebaNumber || '',
        isDefault: b.isDefault || false,
      })),
      userLocations: (dto.userLocations || []).map((l: any) => ({
        id: l.id,
        address: l.address || '',
        postalCode: l.postalCode || '',
        city: l.city || '',
        cityId: l.cityId || '',
        province: l.province || '',
        isDefault: l.isDefault || false,
      })),
      isOrganizationInfoConfirmed: dto.isOrganizationInfoConfirmed || false,
      isOrganizationNoticeDocumentConfirmed: dto.isOrganizationNoticeDocumentConfirmed || false,
      referralCode: dto.referralCode || null,
    };
  }

  static hasRole(user: User, roleName: string): boolean {
    return (user.roles || []).some(
      r => r.roleName.toLowerCase() === roleName.toLowerCase()
    );
  }

  static isAdmin(user: User): boolean {
    return this.hasRole(user, 'Admin');
  }

  static isSeller(user: User): boolean {
    return this.hasRole(user, 'Seller');
  }

  static hasClaim(user: User, claim: string): boolean {
    return (user.roles || []).some(
      r => (r.claims || []).some(c => c.toLowerCase() === claim.toLowerCase())
    );
  }
}