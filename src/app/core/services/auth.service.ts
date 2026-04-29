
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  isAuthenticated = signal<boolean>(false);
  currentUserRole = signal<string | null>(null);

  constructor(private router: Router) {
    if (localStorage.getItem('token')) {
      this.isAuthenticated.set(true);
      this.currentUserRole.set(localStorage.getItem('role'));
    }
  }

  login(identifier: string, passcode: string): boolean {
    // --- DATA HARDCODEADA ---
    const MOCK_USER = 'PX-001-ADMIN';
    const MOCK_PASS = '123456';

    if (identifier === MOCK_USER && passcode === MOCK_PASS) {
      // Simular un token JWT
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_payload.mock_signature';
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('role', 'ADMIN');
      
      this.isAuthenticated.set(true);
      this.currentUserRole.set('ADMIN');
      
      return true;
    }
    
    return false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.isAuthenticated.set(false);
    this.currentUserRole.set(null);
    this.router.navigate(['/auth/login']);
  }
}
