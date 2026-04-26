import { Injectable, signal } from '@angular/core';
import {
  BaseHttpService,
  resolveServiceBaseUrl,
} from '@hishab-nikash/shared-data-access';
import { ApiResponse, AuthResponse, User } from '@hishab-nikash/shared-models';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseHttpService {
  private readonly AUTH_PATH = `${resolveServiceBaseUrl('identity')}/api/v1/auth`;
  
  // Initialize state from Storage for instant reactivity
  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = signal<boolean>(this.hasAccessToken());

  hasAccessToken(): boolean {
    return !!this.getStorageItem('access_token');
  }

  private getStoredUser(): User | null {
    const data = this.getStorageItem('current_user');
    return data ? JSON.parse(data) : null;
  }

  login(credentials: { identifier: string; password: string; tenantId: string }): Observable<AuthResponse> {
    return this.post<ApiResponse<AuthResponse>>(`${this.AUTH_PATH}/login`, credentials).pipe(
      map(res => res.data),
      tap((res) => {
        if (res) {
          this.setSession(res);
        }
      })
    );
  }

  logout(): void {
    if (this.hasAccessToken()) {
      this.post(`${this.AUTH_PATH}/logout`, {})
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    this.clearSession();
  }

  me(): Observable<User> {
    return this.get<ApiResponse<User>>(`${this.AUTH_PATH}/me`).pipe(
      map(res => res.data),
      tap((user) => {
        this.setStorageItem('current_user', JSON.stringify(user));
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      }),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  clearSession(): void {
    this.removeStorageItem('access_token');
    this.removeStorageItem('refresh_token');
    this.removeStorageItem('current_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private setSession(authResult: AuthResponse): void {
    // Explicitly using res.data mapping as confirmed by backend developer
    const token = (authResult as any).accessToken || authResult.access_token;
    const refresh = (authResult as any).refreshToken || authResult.refresh_token;

    if (token) this.setStorageItem('access_token', token);
    if (refresh) this.setStorageItem('refresh_token', refresh);
    if (authResult.user) this.setStorageItem('current_user', JSON.stringify(authResult.user));
    
    this.currentUser.set(authResult.user);
    this.isAuthenticated.set(!!token);
  }

  private getStorageItem(key: string): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  }

  private setStorageItem(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private removeStorageItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}
