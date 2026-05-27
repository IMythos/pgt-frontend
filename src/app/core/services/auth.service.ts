
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';
export interface LoginRequest {
  username: string; 
  password: string;
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

  private readonly AUTH_API_URL = 'http://localhost:8080/api/v1/auth'; 

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    if (localStorage.getItem('token')) {
      this.isAuthenticated.set(true);
      this.currentUserRole.set(localStorage.getItem('role'));
      this.decodeAndSetUser();
    }
  }

  private decodeAndSetUser(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      this.currentUserName.set(decoded.name || decoded.sub || decoded.preferred_username || 'Usuario');
      const role = decoded.role || decoded.rol;
      if (role) this.currentUserRole.set(role);
    } catch {
      this.currentUserName.set('Usuario');
    }
  }

  login(credentials: LoginRequest): Observable<boolean> {
    
    return this.http.post<ApiResponse<LoginResponse>>(`${this.AUTH_API_URL}/login`, credentials).pipe(
      tap((response) => {
        const token = response.data.token;
        const role = response.data.role; 
        
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        
        this.isAuthenticated.set(true);
        this.currentUserRole.set(role);
        this.decodeAndSetUser();
      }),
      // Si todo sale bien, emitimos 'true'
      map(() => true),
      // Si el backend devuelve 401 o 400 (credenciales inválidas), lo capturamos
      catchError((error) => {
        console.error('Error de autenticación:', error);
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    this.isAuthenticated.set(false);
    this.currentUserRole.set(null);
    this.currentUserName.set(null);
    
    this.router.navigate(['/auth/login']);
  }

  // Método auxiliar para el JwtInterceptor que te mostré antes
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
