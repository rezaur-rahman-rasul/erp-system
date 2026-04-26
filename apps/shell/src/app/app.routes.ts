import { Route } from '@angular/router';
import { AppShellComponent } from './components/app-shell/app-shell';
import { authGuard } from '@hishab-nikash/shared-auth';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('identityAccess/Routes').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('identityAccess/Routes').then(m => m.DashboardComponent)
      },
      {
        path: 'iam',
        loadChildren: () =>
          import('identityAccess/Routes').then((m) => m!.remoteRoutes),
      },
      {
        path: 'org',
        loadChildren: () =>
          import('identityAccess/Routes').then((m) => m!.organizationRoutes),
      },
      {
        path: 'master',
        loadChildren: () =>
          import('identityAccess/Routes').then((m) => m!.masterDataRoutes),
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
