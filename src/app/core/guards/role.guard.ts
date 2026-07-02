import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'];
  if (!requiredRole) return true;
  const userRole = authService.currentUserRole();
  if (userRole && userRole.toUpperCase() === requiredRole.toUpperCase()) return true;
  return router.parseUrl('/dashboard');
};