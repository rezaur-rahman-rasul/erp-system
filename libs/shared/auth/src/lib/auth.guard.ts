import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard checking path:', state.url);
  console.log('Is Authenticated:', authService.isAuthenticated());

  if (authService.isAuthenticated()) {
    return true;
  }

  console.log('Unauthorized access attempt. Redirecting to /login');
  // Redirect to login page with the return url
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
