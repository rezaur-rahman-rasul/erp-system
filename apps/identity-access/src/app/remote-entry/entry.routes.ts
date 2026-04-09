import { Route } from '@angular/router';
import { DashboardComponent } from '../pages/dashboard/dashboard';
import { UsersComponent } from '../pages/users/users';
import { RolesComponent } from '../pages/roles/roles';
import { LoginComponent } from '../pages/login/login';

export { DashboardComponent, UsersComponent, RolesComponent, LoginComponent };

export const remoteRoutes: Route[] = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('../pages/dashboard/dashboard').then(m => m.DashboardComponent) },
  { path: 'users', loadComponent: () => import('../pages/users/users').then(m => m.UsersComponent) },
  { path: 'roles', loadComponent: () => import('../pages/roles/roles').then(m => m.RolesComponent) },
  { path: 'login', loadComponent: () => import('../pages/login/login').then(m => m.LoginComponent) }
];
