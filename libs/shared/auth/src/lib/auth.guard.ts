import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasAccessToken()) {
    return createLoginRedirect(router, state.url);
  }

  if (authService.currentUser()) {
    return true;
  }

  return authService.me().pipe(
    map(() => true),
    catchError(() => of(createLoginRedirect(router, state.url)))
  );
};

function createLoginRedirect(router: Router, returnUrl: string) {
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl },
  });
}
