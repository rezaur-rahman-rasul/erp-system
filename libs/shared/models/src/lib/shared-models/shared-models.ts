export interface UserRole {
  id: string;
  code: string;
  name: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  tenantId: string;
  status: UserStatus;
  roles: UserRole[];
  organizationAccesses: OrganizationAccess[];
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  permissions: string[];
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  code: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  displayName: string;
  password: string;
  tenantId: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  displayName: string;
  tenantId: string;
  roleIds: string[];
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AuthResponse {
  accessToken?: string;
  tokenType?: string;
  expiresInSeconds?: number;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  user: User;
}

export interface OrganizationAccess {
  id: string;
  userId: string;
  legalEntityId: string;
  branchId: string | null;
  primaryAccess: boolean;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface CreateOrganizationAccessRequest {
  legalEntityId: string;
  branchId?: string | null;
  primaryAccess: boolean;
}

export interface UpdateOrganizationAccessRequest {
  primaryAccess: boolean;
}

export interface PermissionDefinition {
  code: string;
  service: string;
  description: string;
}

export interface AuthorizationAction {
  code: string;
  name: string;
  appliesToTypes: string;
  status: string;
}

export interface AuthorizationResource {
  id: string;
  code: string;
  fullCode: string;
  name: string;
  type: string;
  parentFullCode?: string | null;
  serviceCode: string;
  pathDepth: number;
  status: string;
  metadata?: string | null;
}

export interface ResourcePermission {
  id: string;
  permissionKey: string;
  resourceCode: string;
  actionCode: string;
  serviceCode: string;
  description: string;
  status: string;
  aliases: string[];
}

export interface EffectivePermissionsResponse {
  userId: string;
  permissions: string[];
}

export type OrganizationRecordStatus = 'ACTIVE' | 'INACTIVE';

export interface LegalEntity {
  id: string;
  code: string;
  legalName: string;
  tradeName?: string;
  registrationNumber: string;
  taxNumber?: string;
  countryCode: string;
  baseCurrencyCode: string;
  fiscalYearStartMonth: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: OrganizationRecordStatus | string;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface CreateLegalEntityRequest {
  code: string;
  legalName: string;
  tradeName?: string;
  registrationNumber: string;
  taxNumber?: string;
  countryCode: string;
  baseCurrencyCode: string;
  fiscalYearStartMonth: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface UpdateLegalEntityRequest {
  legalName: string;
  tradeName?: string;
  registrationNumber: string;
  taxNumber?: string;
  countryCode: string;
  baseCurrencyCode: string;
  fiscalYearStartMonth: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: OrganizationRecordStatus | string;
}

export interface ChangeLegalEntityStatusRequest {
  status: OrganizationRecordStatus | string;
}

export interface BusinessUnit {
  id: string;
  legalEntityId: string;
  code: string;
  name: string;
  description?: string;
  managerEmployeeId?: string | null;
  status: OrganizationRecordStatus | string;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface CreateBusinessUnitRequest {
  legalEntityId: string;
  code: string;
  name: string;
  description?: string;
  managerEmployeeId?: string | null;
}

export interface UpdateBusinessUnitRequest {
  name: string;
  description?: string;
  managerEmployeeId?: string | null;
  status: OrganizationRecordStatus | string;
}

export interface Branch {
  id: string;
  legalEntityId: string;
  businessUnitId?: string | null;
  code: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  status: OrganizationRecordStatus | string;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface CreateBranchRequest {
  legalEntityId: string;
  businessUnitId?: string | null;
  code: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
  email?: string;
  timezone?: string;
}

export interface UpdateBranchRequest {
  businessUnitId?: string | null;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  status: OrganizationRecordStatus | string;
}

export interface Department {
  id: string;
  legalEntityId: string;
  branchId?: string | null;
  parentDepartmentId?: string | null;
  code: string;
  name: string;
  headEmployeeId?: string | null;
  status: OrganizationRecordStatus | string;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface CreateDepartmentRequest {
  legalEntityId: string;
  branchId?: string | null;
  parentDepartmentId?: string | null;
  code: string;
  name: string;
  headEmployeeId?: string | null;
}

export interface UpdateDepartmentRequest {
  branchId?: string | null;
  name: string;
  parentDepartmentId?: string | null;
  headEmployeeId?: string | null;
  status: OrganizationRecordStatus | string;
}

export interface TenantProfile {
  id: string;
  tenantCode: string;
  legalEntityId: string;
  companyName: string;
  brandName?: string;
  supportEmail?: string;
  websiteUrl?: string;
  logoUrl?: string;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface BusinessUnitSummary {
  id: string;
  code: string;
  name: string;
  status: string;
}

export interface LocationSummary {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
}

export interface DepartmentTree {
  id: string;
  code: string;
  name: string;
  status: string;
  children: DepartmentTree[];
}

export interface BranchTree {
  id: string;
  businessUnitId?: string | null;
  code: string;
  name: string;
  status: string;
  locations: LocationSummary[];
  departments: DepartmentTree[];
}

export interface OrganizationTree {
  legalEntityId: string;
  legalEntityCode: string;
  legalEntityName: string;
  status: string;
  businessUnits: BusinessUnitSummary[];
  branches: BranchTree[];
}

export interface HierarchyValidationRequest {
  departmentId: string;
  proposedParentDepartmentId?: string | null;
}

export interface HierarchyValidationResponse {
  valid: boolean;
  message: string;
}

export interface MasterDataAuditedRecord {
  id: string;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface MasterDataActiveRecord extends MasterDataAuditedRecord {
  active: boolean;
}

export interface Currency extends MasterDataActiveRecord {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

export interface Customer extends MasterDataActiveRecord {
  tenantId: string;
  legalEntityId: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  taxNumber?: string;
}

export interface Supplier extends MasterDataActiveRecord {
  tenantId: string;
  legalEntityId: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  taxNumber?: string;
}

export interface Employee extends MasterDataActiveRecord {
  tenantId: string;
  legalEntityId: string;
  employeeNumber: string;
  fullName: string;
  email?: string;
  phone?: string;
  designation?: string;
}

export interface PaymentTerm extends MasterDataActiveRecord {
  code: string;
  name: string;
  dueDays: number;
  discountDays?: number | null;
  discountPercentage?: number | string | null;
}

export interface Product extends MasterDataActiveRecord {
  tenantId: string;
  legalEntityId: string;
  code: string;
  name: string;
  description?: string;
  unitOfMeasureId?: string | null;
}

export interface ChartOfAccount extends MasterDataActiveRecord {
  tenantId: string;
  legalEntityId: string;
  code: string;
  name: string;
  accountType: string;
  parentAccountId?: string | null;
  postingAllowed: boolean;
}

export interface TaxCode extends MasterDataActiveRecord {
  tenantId: string;
  legalEntityId: string;
  code: string;
  name: string;
  rate: number | string;
  inclusive: boolean;
}

export interface UnitOfMeasure extends MasterDataActiveRecord {
  code: string;
  name: string;
  category?: string;
  baseUnit: boolean;
  conversionFactor: number | string;
}

export interface Warehouse extends MasterDataActiveRecord {
  tenantId: string;
  legalEntityId: string;
  code: string;
  name: string;
  branchId?: string | null;
  locationCode?: string;
}

export interface MasterDataCatalogSnapshot {
  chartOfAccounts: ChartOfAccount[];
  currencies: Currency[];
  customers: Customer[];
  employees: Employee[];
  paymentTerms: PaymentTerm[];
  products: Product[];
  suppliers: Supplier[];
  taxCodes: TaxCode[];
  unitsOfMeasure: UnitOfMeasure[];
  warehouses: Warehouse[];
}
