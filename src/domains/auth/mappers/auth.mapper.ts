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
      job: dto.job || null,
      naturalPersonEconomicCode: dto.naturalPersonEconomicCode || null,
      educationType: dto.educationType || null,
      gender: dto.gender || null,
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
      legalInfo: dto.legalInfo ? {
        organizationName: dto.legalInfo.organizationName || null,
        organizationType: dto.legalInfo.organizationType || null,
        organizationEconomicCode: dto.legalInfo.organizationEconomicCode || null,
        organizationNationalCode: dto.legalInfo.organizationNationalCode || null,
        organizationRegisterationCode: dto.legalInfo.organizationRegisterationCode || null,
        organizationNoticeDocument: dto.legalInfo.organizationNoticeDocument || null,
        organizationHeadOfficeCityId: dto.legalInfo.organizationHeadOfficeCityId || null,
        organizationHeadOfficeCity: dto.legalInfo.organizationHeadOfficeCity || null,
        organizationHeadOfficeProvinceId: dto.legalInfo.organizationHeadOfficeProvinceId || null,
        organizationHeadOfficeProvince: dto.legalInfo.organizationHeadOfficeProvince || null,
        organizationHeadOfficeTel: dto.legalInfo.organizationHeadOfficeTel || null,
      } : null,
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