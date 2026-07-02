
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  role: string; 
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  isAuthenticated = signal<boolean>(false);
  currentUserRole = signal<string | null>(null);
  currentUserName = signal<string | null>(null);
  sessionExpired = signal<boolean>(false);
  private readonly AUTH_API_URL = `${environment.apiUrl}/auth`;
  private readonly REMEMBERED_USER_KEY = 'rememberedUser';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);
      const role = localStorage.getItem('role') || sessionStorage.getItem('role');
      this.currentUserRole.set(role);
      this.decodeAndSetUser();
    }
  }

  private decodeAndSetUser(): void {
    const token = this.getToken();
    if (!token) return;
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      this.currentUserName.set(decoded.name || decoded.sub || decoded.preferred_username || 'Usuario');
      let role = decoded.role || decoded.rol;
      if (role) {
        if (role.startsWith('ROLE_')) role = role.slice(5);
        this.currentUserRole.set(role);
      }
    } catch {
      this.currentUserName.set('Usuario');
    }
  }

  login(credentials: LoginRequest): Observable<boolean> {
    const { rememberMe, ...loginPayload } = credentials;

    return this.http.post<ApiResponse<LoginResponse>>(`${this.AUTH_API_URL}/login`, loginPayload).pipe(
      tap((response) => {
        const token = response.data.token;
        let role = response.data.role;
        if (role && role.startsWith('ROLE_')) role = role.slice(5);

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', token);
        storage.setItem('role', role);

        if (rememberMe) {
          this.saveRememberedUser(loginPayload.username);
        } else {
          this.clearRememberedUser();
        }

        this.isAuthenticated.set(true);
        this.currentUserRole.set(role);
        this.decodeAndSetUser();
      }),
      map(() => true),
      catchError((error) => {
        console.error('Error de autenticación:', error);
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    this.clearRememberedUser();

    this.isAuthenticated.set(false);
    this.currentUserRole.set(null);
    this.currentUserName.set(null);

    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  
  handleSessionExpired(): void {
    this.sessionExpired.set(true);
  }

  confirmSessionExpired(): void {
    this.sessionExpired.set(false);
    this.logout();
  }

  saveRememberedUser(username: string): void {
    localStorage.setItem(this.REMEMBERED_USER_KEY, username);
  }

  getRememberedUser(): string | null {
    return localStorage.getItem(this.REMEMBERED_USER_KEY);
  }

  clearRememberedUser(): void {
    localStorage.removeItem(this.REMEMBERED_USER_KEY);
  }
}
