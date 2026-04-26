import { Route } from '@angular/router';
import { AccessCatalogComponent } from '../pages/access-catalog/access-catalog';
import { DashboardComponent } from '../pages/dashboard/dashboard';
import { LoginComponent } from '../pages/login/login';
import { RolesComponent } from '../pages/roles/roles';
import { UsersComponent } from '../pages/users/users';

export {
  AccessCatalogComponent,
  DashboardComponent,
  LoginComponent,
  RolesComponent,
  UsersComponent,
};

export const remoteRoutes: Route[] = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../pages/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'access-catalog',
    loadComponent: () =>
      import('../pages/access-catalog/access-catalog').then(
        (m) => m.AccessCatalogComponent
      ),
  },
  {
    path: 'users',
    loadComponent: () => import('../pages/users/users').then((m) => m.UsersComponent),
  },
  {
    path: 'users/create',
    loadComponent: () =>
      import('../pages/users/user-form/user-form').then(
        (m) => m.UserFormComponent
      ),
  },
  {
    path: 'users/:id/edit',
    loadComponent: () =>
      import('../pages/users/user-form/user-form').then(
        (m) => m.UserFormComponent
      ),
  },
  {
    path: 'roles/create',
    loadComponent: () =>
      import('../pages/roles/role-form/role-form').then(
        (m) => m.RoleFormComponent
      ),
  },
  {
    path: 'roles/:id/edit',
    loadComponent: () =>
      import('../pages/roles/role-form/role-form').then(
        (m) => m.RoleFormComponent
      ),
  },
  {
    path: 'roles',
    loadComponent: () => import('../pages/roles/roles').then((m) => m.RolesComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('../pages/login/login').then((m) => m.LoginComponent),
  },
];

export const organizationRoutes: Route[] = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../pages/organization/dashboard/dashboard').then(
        (m) => m.OrganizationDashboardComponent
      ),
  },
  {
    path: 'legal-entities',
    loadComponent: () =>
      import('../pages/organization/legal-entities/legal-entities').then(
        (m) => m.LegalEntitiesComponent
      ),
  },
  {
    path: 'legal-entities/create',
    loadComponent: () =>
      import(
        '../pages/organization/legal-entities/legal-entity-form/legal-entity-form'
      ).then((m) => m.LegalEntityFormComponent),
  },
  {
    path: 'legal-entities/:id/edit',
    loadComponent: () =>
      import(
        '../pages/organization/legal-entities/legal-entity-form/legal-entity-form'
      ).then((m) => m.LegalEntityFormComponent),
  },
  {
    path: 'business-units',
    loadComponent: () =>
      import('../pages/organization/business-units/business-units').then(
        (m) => m.BusinessUnitsComponent
      ),
  },
  {
    path: 'business-units/create',
    loadComponent: () =>
      import(
        '../pages/organization/business-units/business-unit-form/business-unit-form'
      ).then((m) => m.BusinessUnitFormComponent),
  },
  {
    path: 'business-units/:id/edit',
    loadComponent: () =>
      import(
        '../pages/organization/business-units/business-unit-form/business-unit-form'
      ).then((m) => m.BusinessUnitFormComponent),
  },
  {
    path: 'branches',
    loadComponent: () =>
      import('../pages/organization/branches/branches').then(
        (m) => m.BranchesComponent
      ),
  },
  {
    path: 'branches/create',
    loadComponent: () =>
      import('../pages/organization/branches/branch-form/branch-form').then(
        (m) => m.BranchFormComponent
      ),
  },
  {
    path: 'branches/:id/edit',
    loadComponent: () =>
      import('../pages/organization/branches/branch-form/branch-form').then(
        (m) => m.BranchFormComponent
      ),
  },
  {
    path: 'departments',
    loadComponent: () =>
      import('../pages/organization/departments/departments').then(
        (m) => m.DepartmentsComponent
      ),
  },
  {
    path: 'departments/create',
    loadComponent: () =>
      import(
        '../pages/organization/departments/department-form/department-form'
      ).then((m) => m.DepartmentFormComponent),
  },
  {
    path: 'departments/:id/edit',
    loadComponent: () =>
      import(
        '../pages/organization/departments/department-form/department-form'
      ).then((m) => m.DepartmentFormComponent),
  },
  {
    path: 'hierarchy',
    loadComponent: () =>
      import('../pages/organization/hierarchy/hierarchy').then(
        (m) => m.OrganizationHierarchyComponent
      ),
  },
];

export const masterDataRoutes: Route[] = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../pages/master-data/dashboard/dashboard').then(
        (m) => m.MasterDataDashboardComponent
      ),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('../pages/master-data/catalog/catalog').then(
        (m) => m.MasterDataCatalogComponent
      ),
  },
];
