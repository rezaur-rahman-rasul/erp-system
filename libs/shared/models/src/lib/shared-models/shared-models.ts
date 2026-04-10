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
  organizationAccesses: any[];
  // Audit fields — exact names from backend UserResponse
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

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface OrganizationAccess {
  id: string;
  organizationId: string;
  organizationName: string;
  role: string;
  status: string;
}
