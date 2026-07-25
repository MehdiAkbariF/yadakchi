export interface UserRole {
  roleName: string;
  claims: string[];
}

export interface BankAccount {
  id: string;
  cardNumber: string;
  shebaNumber: string;
  isDefault: boolean;
}

export interface UserLocation {
  id: string;
  address: string;
  postalCode: string;
  city: string;
  cityId: string;
  province: string;
  isDefault: boolean;
}

export interface LegalInfo {
  organizationName: string | null;
  organizationType: string | null;
  organizationEconomicCode: string | null;
  organizationNationalCode: string | null;
  organizationRegisterationCode: string | null;
  organizationNoticeDocument: string | null;
  organizationHeadOfficeCityId: string | null;
  organizationHeadOfficeCity: string | null;
  organizationHeadOfficeProvinceId: string | null;
  organizationHeadOfficeProvince: string | null;
  organizationHeadOfficeTel: string | null;
}

export interface User {
  id: string;
  lastName: string;
  fullName: string;
  userName: string;
  status: string;
  registerDate: string;
  birthDate?: string;
  job: string | null;
  naturalPersonEconomicCode: string | null;
  educationType: string | null;
  gender: string | null;
  userChosenCity: string | null;
  userChosenCityId: string | null;
  shopTitle: string | null;
  phoneNumber: string;
  phoneNumberConfirmed: boolean;
  nationalCode: string | null;
  email: string | null;
  isEmailConfirmed: boolean;
  roles: UserRole[];
  bankAccounts: BankAccount[];
  userLocations: UserLocation[];
  legalInfo: LegalInfo | null;
  isOrganizationInfoConfirmed?: boolean;
  isOrganizationNoticeDocumentConfirmed?: boolean;
  referralCode?: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}