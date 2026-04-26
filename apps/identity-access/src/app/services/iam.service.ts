import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BaseHttpService,
  resolveServiceBaseUrl,
} from '@hishab-nikash/shared-data-access';
import {
  ApiResponse,
  AuthorizationAction,
  AuthorizationResource,
  CreateOrganizationAccessRequest,
  CreateRoleRequest,
  CreateUserRequest,
  EffectivePermissionsResponse,
  OrganizationAccess,
  PermissionDefinition,
  ResourcePermission,
  Role,
  UpdateOrganizationAccessRequest,
  UpdateRoleRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  User,
} from '@hishab-nikash/shared-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IAMService extends BaseHttpService {
  private readonly USERS_PATH = `${resolveServiceBaseUrl('identity')}/api/v1/users`;
  private readonly ROLES_PATH = `${resolveServiceBaseUrl('identity')}/api/v1/roles`;
  private readonly PERMISSIONS_PATH = `${resolveServiceBaseUrl('identity')}/api/v1/permissions`;
  private readonly AUTHORIZATION_PATH = `${resolveServiceBaseUrl('identity')}/api/v1/authz`;

  getUsers(pagination: {
    page: number;
    limit: number;
    sort?: string;
    order?: string;
    filters?: Record<string, string>;
  }): Observable<User[]> {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('limit', pagination.limit.toString());

    if (pagination.sort) {
      params = params.set('sort', pagination.sort);
      params = params.set('order', pagination.order || 'asc');
    }

    if (pagination.filters) {
      Object.entries(pagination.filters).forEach(([key, value]) => {
        if (value) {
          params = params.set(key, value);
        }
      });
    }

    return this.get<ApiResponse<User[]>>(this.USERS_PATH, params).pipe(
      map((res) => res.data)
    );
  }

  getUserById(id: string): Observable<User> {
    return this.get<ApiResponse<User>>(`${this.USERS_PATH}/${id}`).pipe(
      map((res) => res.data)
    );
  }

  createUser(payload: CreateUserRequest): Observable<User> {
    return this.post<ApiResponse<User>>(this.USERS_PATH, payload).pipe(
      map((res) => res.data)
    );
  }

  updateUser(id: string, payload: UpdateUserRequest): Observable<User> {
    return this.put<ApiResponse<User>>(`${this.USERS_PATH}/${id}`, payload).pipe(
      map((res) => res.data)
    );
  }

  updateUserStatus(
    id: string,
    payload: UpdateUserStatusRequest
  ): Observable<User | null> {
    return this.patch<ApiResponse<User> | ApiResponse<null> | User | null>(
      `${this.USERS_PATH}/${id}/status`,
      payload
    ).pipe(
      map((res) => {
        if (!res) {
          return null;
        }

        return 'data' in res ? res.data ?? null : res;
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.delete<ApiResponse<null> | void>(`${this.USERS_PATH}/${id}`).pipe(
      map(() => undefined)
    );
  }

  getRoles(): Observable<Role[]> {
    return this.get<ApiResponse<Role[]>>(this.ROLES_PATH).pipe(
      map((res) => res.data)
    );
  }

  getRoleById(id: string): Observable<Role> {
    return this.get<ApiResponse<Role>>(`${this.ROLES_PATH}/${id}`).pipe(
      map((res) => res.data)
    );
  }

  createRole(payload: CreateRoleRequest): Observable<Role> {
    return this.post<ApiResponse<Role>>(this.ROLES_PATH, payload).pipe(
      map((res) => res.data)
    );
  }

  updateRole(id: string, payload: UpdateRoleRequest): Observable<Role> {
    return this.put<ApiResponse<Role>>(`${this.ROLES_PATH}/${id}`, payload).pipe(
      map((res) => res.data)
    );
  }

  deleteRole(id: string): Observable<void> {
    return this.delete<ApiResponse<null> | void>(`${this.ROLES_PATH}/${id}`).pipe(
      map(() => undefined)
    );
  }

  getOrganizationAccess(userId: string): Observable<OrganizationAccess[]> {
    return this.get<ApiResponse<OrganizationAccess[]>>(
      `${this.USERS_PATH}/${userId}/organization-access`
    ).pipe(map((res) => res.data));
  }

  updateOrganizationAccess(
    userId: string,
    accessId: string,
    data: UpdateOrganizationAccessRequest
  ): Observable<OrganizationAccess> {
    return this.put<ApiResponse<OrganizationAccess>>(
      `${this.USERS_PATH}/${userId}/organization-access/${accessId}`,
      data
    ).pipe(map((res) => res.data));
  }

  createOrganizationAccess(
    userId: string,
    data: CreateOrganizationAccessRequest
  ): Observable<OrganizationAccess> {
    return this.post<ApiResponse<OrganizationAccess>>(
      `${this.USERS_PATH}/${userId}/organization-access`,
      data
    ).pipe(map((res) => res.data));
  }

  getPermissionDefinitions(): Observable<PermissionDefinition[]> {
    return this.get<ApiResponse<PermissionDefinition[]>>(
      this.PERMISSIONS_PATH
    ).pipe(map((res) => res.data));
  }

  getAuthorizationActions(): Observable<AuthorizationAction[]> {
    return this.get<ApiResponse<AuthorizationAction[]>>(
      `${this.AUTHORIZATION_PATH}/actions`
    ).pipe(map((res) => res.data));
  }

  getAuthorizationResources(filters?: {
    query?: string;
    serviceCode?: string;
    type?: string;
  }): Observable<AuthorizationResource[]> {
    let params = new HttpParams();

    if (filters?.query) {
      params = params.set('query', filters.query);
    }

    if (filters?.serviceCode) {
      params = params.set('serviceCode', filters.serviceCode);
    }

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    return this.get<ApiResponse<AuthorizationResource[]>>(
      `${this.AUTHORIZATION_PATH}/resources`,
      params
    ).pipe(map((res) => res.data));
  }

  getResourcePermissions(): Observable<ResourcePermission[]> {
    return this.get<ApiResponse<ResourcePermission[]>>(
      `${this.AUTHORIZATION_PATH}/permissions`
    ).pipe(map((res) => res.data));
  }

  getEffectivePermissions(
    userId?: string
  ): Observable<EffectivePermissionsResponse> {
    return this.post<ApiResponse<EffectivePermissionsResponse>>(
      `${this.AUTHORIZATION_PATH}/effective-permissions`,
      userId ? { userId } : {}
    ).pipe(map((res) => res.data));
  }
}
