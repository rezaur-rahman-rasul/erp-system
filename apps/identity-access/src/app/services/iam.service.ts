import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseHttpService } from '@hishab-nikash/shared-data-access';
import {
  ApiResponse,
  CreateRoleRequest,
  CreateUserRequest,
  OrganizationAccess,
  Role,
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
  private readonly USERS_PATH = '/api/v1/users';
  private readonly ROLES_PATH = '/api/v1/roles';

  // Users
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
      map(res => res.data)
    );
  }

  getUserById(id: string): Observable<User> {
    return this.get<ApiResponse<User>>(`${this.USERS_PATH}/${id}`).pipe(
      map(res => res.data)
    );
  }

  createUser(payload: CreateUserRequest): Observable<User> {
    return this.post<ApiResponse<User>>(this.USERS_PATH, payload).pipe(
      map(res => res.data)
    );
  }

  updateUser(id: string, payload: UpdateUserRequest): Observable<User> {
    return this.put<ApiResponse<User>>(`${this.USERS_PATH}/${id}`, payload).pipe(
      map(res => res.data)
    );
  }

  updateUserStatus(id: string, payload: UpdateUserStatusRequest): Observable<User | null> {
    return this.patch<ApiResponse<User> | ApiResponse<null> | User | null>(`${this.USERS_PATH}/${id}/status`, payload).pipe(
      map((res) => {
        if (!res) return null;
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
      map(res => res.data)
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

  // Organization Access
  getOrganizationAccess(userId: string): Observable<OrganizationAccess[]> {
    return this.get<ApiResponse<OrganizationAccess[]>>(`${this.USERS_PATH}/${userId}/organization-access`).pipe(
      map(res => res.data)
    );
  }

  updateOrganizationAccess(userId: string, accessId: string, data: Partial<OrganizationAccess>): Observable<OrganizationAccess> {
    return this.put<ApiResponse<OrganizationAccess>>(`${this.USERS_PATH}/${userId}/organization-access/${accessId}`, data).pipe(
      map(res => res.data)
    );
  }

  createOrganizationAccess(userId: string, data: Partial<OrganizationAccess>): Observable<OrganizationAccess> {
    return this.post<ApiResponse<OrganizationAccess>>(`${this.USERS_PATH}/${userId}/organization-access`, data).pipe(
      map(res => res.data)
    );
  }
}
