import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseHttpService } from '@hishab-nikash/shared-data-access';
import { ApiResponse, OrganizationAccess, Role, User } from '@hishab-nikash/shared-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IAMService extends BaseHttpService {
  private readonly USERS_PATH = '/api/v1/users';
  private readonly ROLES_PATH = '/api/v1/roles';

  // Users
  getUsers(pagination: { page: number; limit: number; sort?: string; order?: string }): Observable<User[]> {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('limit', pagination.limit.toString());

    if (pagination.sort) {
      params = params.set('sort', pagination.sort);
      params = params.set('order', pagination.order || 'asc');
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

  // Roles
  getRoles(): Observable<Role[]> {
    return this.get<ApiResponse<Role[]>>(this.ROLES_PATH).pipe(
      map(res => res.data)
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
