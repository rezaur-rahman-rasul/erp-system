import { Route } from '@angular/router';
import {
  masterDataRoutes,
  organizationRoutes,
  remoteRoutes,
} from './remote-entry/entry.routes';

export const appRoutes: Route[] = [
  ...remoteRoutes,
  {
    path: 'org',
    children: organizationRoutes,
  },
  {
    path: 'master',
    children: masterDataRoutes,
  },
];
