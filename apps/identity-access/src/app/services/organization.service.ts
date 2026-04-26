import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BaseHttpService,
  resolveServiceBaseUrl,
} from '@hishab-nikash/shared-data-access';
import {
  ApiResponse,
  Branch,
  BusinessUnit,
  CreateBranchRequest,
  CreateBusinessUnitRequest,
  CreateDepartmentRequest,
  CreateLegalEntityRequest,
  Department,
  HierarchyValidationRequest,
  HierarchyValidationResponse,
  LegalEntity,
  OrganizationTree,
  PageResult,
  TenantProfile,
  UpdateBranchRequest,
  UpdateBusinessUnitRequest,
  UpdateDepartmentRequest,
  UpdateLegalEntityRequest,
} from '@hishab-nikash/shared-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService extends BaseHttpService {
  private readonly LEGAL_ENTITIES_PATH = `${resolveServiceBaseUrl('organization')}/api/v1/legal-entities`;
  private readonly BUSINESS_UNITS_PATH = `${resolveServiceBaseUrl('organization')}/api/v1/business-units`;
  private readonly BRANCHES_PATH = `${resolveServiceBaseUrl('organization')}/api/v1/branches`;
  private readonly DEPARTMENTS_PATH = `${resolveServiceBaseUrl('organization')}/api/v1/departments`;
  private readonly TENANT_PROFILES_PATH = `${resolveServiceBaseUrl('organization')}/api/v1/tenant-profiles`;
  private readonly HIERARCHY_PATH = `${resolveServiceBaseUrl('organization')}/api/v1/org-tree`;
  private readonly HIERARCHY_VALIDATE_PATH = `${resolveServiceBaseUrl('organization')}/api/v1/hierarchy/validate`;

  getLegalEntities(pagination?: {
    page?: number;
    size?: number;
  }): Observable<PageResult<LegalEntity>> {
    return this.getPage<LegalEntity>(this.LEGAL_ENTITIES_PATH, pagination);
  }

  getAllLegalEntities(): Observable<LegalEntity[]> {
    return this.getLegalEntities({ page: 1, size: 500 }).pipe(
      map((result) => result.content ?? [])
    );
  }

  getLegalEntityById(id: string): Observable<LegalEntity> {
    return this.get<ApiResponse<LegalEntity>>(`${this.LEGAL_ENTITIES_PATH}/${id}`).pipe(
      map((response) => response.data)
    );
  }

  createLegalEntity(payload: CreateLegalEntityRequest): Observable<LegalEntity> {
    return this.post<ApiResponse<LegalEntity>>(this.LEGAL_ENTITIES_PATH, payload).pipe(
      map((response) => response.data)
    );
  }

  updateLegalEntity(
    id: string,
    payload: UpdateLegalEntityRequest
  ): Observable<LegalEntity> {
    return this.put<ApiResponse<LegalEntity>>(
      `${this.LEGAL_ENTITIES_PATH}/${id}`,
      payload
    ).pipe(map((response) => response.data));
  }

  changeLegalEntityStatus(
    id: string,
    status: string
  ): Observable<LegalEntity> {
    return this.patch<ApiResponse<LegalEntity>>(
      `${this.LEGAL_ENTITIES_PATH}/${id}/status`,
      { status }
    ).pipe(map((response) => response.data));
  }

  getBusinessUnits(filters?: {
    page?: number;
    size?: number;
    legalEntityId?: string;
  }): Observable<PageResult<BusinessUnit>> {
    return this.getPage<BusinessUnit>(this.BUSINESS_UNITS_PATH, filters, {
      legalEntityId: filters?.legalEntityId,
    });
  }

  getAllBusinessUnits(legalEntityId?: string): Observable<BusinessUnit[]> {
    return this.getBusinessUnits({
      page: 1,
      size: 500,
      legalEntityId,
    }).pipe(map((result) => result.content ?? []));
  }

  getBusinessUnitById(id: string): Observable<BusinessUnit> {
    return this.get<ApiResponse<BusinessUnit>>(`${this.BUSINESS_UNITS_PATH}/${id}`).pipe(
      map((response) => response.data)
    );
  }

  createBusinessUnit(
    payload: CreateBusinessUnitRequest
  ): Observable<BusinessUnit> {
    return this.post<ApiResponse<BusinessUnit>>(this.BUSINESS_UNITS_PATH, payload).pipe(
      map((response) => response.data)
    );
  }

  updateBusinessUnit(
    id: string,
    payload: UpdateBusinessUnitRequest
  ): Observable<BusinessUnit> {
    return this.put<ApiResponse<BusinessUnit>>(
      `${this.BUSINESS_UNITS_PATH}/${id}`,
      payload
    ).pipe(map((response) => response.data));
  }

  getBranches(filters?: {
    page?: number;
    size?: number;
    legalEntityId?: string;
  }): Observable<PageResult<Branch>> {
    return this.getPage<Branch>(this.BRANCHES_PATH, filters, {
      legalEntityId: filters?.legalEntityId,
    });
  }

  getAllBranches(legalEntityId?: string): Observable<Branch[]> {
    return this.getBranches({
      page: 1,
      size: 500,
      legalEntityId,
    }).pipe(map((result) => result.content ?? []));
  }

  getBranchById(id: string): Observable<Branch> {
    return this.get<ApiResponse<Branch>>(`${this.BRANCHES_PATH}/${id}`).pipe(
      map((response) => response.data)
    );
  }

  createBranch(payload: CreateBranchRequest): Observable<Branch> {
    return this.post<ApiResponse<Branch>>(this.BRANCHES_PATH, payload).pipe(
      map((response) => response.data)
    );
  }

  updateBranch(id: string, payload: UpdateBranchRequest): Observable<Branch> {
    return this.put<ApiResponse<Branch>>(`${this.BRANCHES_PATH}/${id}`, payload).pipe(
      map((response) => response.data)
    );
  }

  getDepartments(filters?: {
    page?: number;
    size?: number;
    branchId?: string;
  }): Observable<PageResult<Department>> {
    return this.getPage<Department>(this.DEPARTMENTS_PATH, filters, {
      branchId: filters?.branchId,
    });
  }

  getAllDepartments(branchId?: string): Observable<Department[]> {
    return this.getDepartments({
      page: 1,
      size: 500,
      branchId,
    }).pipe(map((result) => result.content ?? []));
  }

  getDepartmentById(id: string): Observable<Department> {
    return this.get<ApiResponse<Department>>(`${this.DEPARTMENTS_PATH}/${id}`).pipe(
      map((response) => response.data)
    );
  }

  createDepartment(payload: CreateDepartmentRequest): Observable<Department> {
    return this.post<ApiResponse<Department>>(this.DEPARTMENTS_PATH, payload).pipe(
      map((response) => response.data)
    );
  }

  updateDepartment(
    id: string,
    payload: UpdateDepartmentRequest
  ): Observable<Department> {
    return this.put<ApiResponse<Department>>(
      `${this.DEPARTMENTS_PATH}/${id}`,
      payload
    ).pipe(map((response) => response.data));
  }

  getTenantProfiles(filters?: {
    page?: number;
    size?: number;
    legalEntityId?: string;
  }): Observable<PageResult<TenantProfile>> {
    return this.getPage<TenantProfile>(this.TENANT_PROFILES_PATH, filters, {
      legalEntityId: filters?.legalEntityId,
    });
  }

  getOrganizationTrees(): Observable<OrganizationTree[]> {
    return this.get<ApiResponse<OrganizationTree[]>>(this.HIERARCHY_PATH).pipe(
      map((response) => response.data)
    );
  }

  getOrganizationTree(legalEntityId: string): Observable<OrganizationTree> {
    return this.get<ApiResponse<OrganizationTree>>(
      `${this.HIERARCHY_PATH}/${legalEntityId}`
    ).pipe(map((response) => response.data));
  }

  validateHierarchy(
    payload: HierarchyValidationRequest
  ): Observable<HierarchyValidationResponse> {
    return this.post<ApiResponse<HierarchyValidationResponse>>(
      this.HIERARCHY_VALIDATE_PATH,
      payload
    ).pipe(map((response) => response.data));
  }

  private getPage<T>(
    path: string,
    pagination?: {
      page?: number;
      size?: number;
    },
    extraParams?: Record<string, string | undefined>
  ): Observable<PageResult<T>> {
    let params = new HttpParams()
      .set('page', String(Math.max((pagination?.page ?? 1) - 1, 0)))
      .set('size', String(pagination?.size ?? 50));

    Object.entries(extraParams ?? {}).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.get<ApiResponse<PageResult<T>>>(path, params).pipe(
      map((response) => response.data)
    );
  }
}
