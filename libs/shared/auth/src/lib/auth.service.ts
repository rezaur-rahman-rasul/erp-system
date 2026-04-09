import { Injectable, signal } from '@angular/core';
import { BaseHttpService } from '@hishab-nikash/shared-data-access';
import { ApiResponse, AuthResponse, User } from '@hishab-nikash/shared-models';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseHttpService {
  private readonly AUTH_PATH = '/api/v1/auth';
  
  // Initialize state from Storage for instant reactivity
  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = signal<boolean>(!!localStorage.getItem('access_token'));

  private getStoredUser(): User | null {
    const data = localStorage.getItem('current_user');
    return data ? JSON.parse(data) : null;
  }

  login(credentials: { identifier: string; password: string; tenantId: string }): Observable<AuthResponse> {
    console.log('Attempting login with:', credentials);
    return this.post<ApiResponse<AuthResponse>>(`${this.AUTH_PATH}/login`, credentials).pipe(
      map(res => {
        console.log('Raw Login Response:', res);
        return res.data;
      }),
      tap((res) => {
        if (res) {
          console.log('Mapping Auth Response:', res);
          this.setSession(res);
        } else {
          console.error('No data found in login response');
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.post(`${this.AUTH_PATH}/logout`, {}).subscribe();
  }

  me(): Observable<User> {
    return this.get<ApiResponse<User>>(`${this.AUTH_PATH}/me`).pipe(
      map(res => res.data),
      tap((user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  private setSession(authResult: AuthResponse): void {
    // Explicitly using res.data mapping as confirmed by backend developer
    const token = (authResult as any).accessToken || authResult.access_token;
    const refresh = (authResult as any).refreshToken || authResult.refresh_token;

    if (token) localStorage.setItem('access_token', token);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    if (authResult.user) localStorage.setItem('current_user', JSON.stringify(authResult.user));
    
    this.currentUser.set(authResult.user);
    this.isAuthenticated.set(!!token);
    console.log('Session secured. Token stored. Authenticated:', this.isAuthenticated());
  }
}
