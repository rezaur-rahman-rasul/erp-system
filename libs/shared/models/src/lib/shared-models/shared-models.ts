export interface UserRole {
  id: string;
  code: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  tenantId: string;
  status: 'ACTIVE' | 'INACTIVE';
  roles: UserRole[];
  organizationAccesses: any[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
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
