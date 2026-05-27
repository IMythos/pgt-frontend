import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {
  loginForm: FormGroup;
  showPassword = signal<boolean>(false);
  loginError = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loginError.set(false);
      this.isLoading.set(true);

      const { identifier, password } = this.loginForm.value;

      const requestPayload: LoginRequest = {
        username: identifier,
        password: password,
      };

      this.authService.login(requestPayload).subscribe({
        next: (success: boolean) => {
          this.isLoading.set(false);

          if (success) {
            console.log('Login exitoso, redirigiendo...');
            this.router.navigate(['/dashboard']);
          } else {
            this.loginError.set(true);
            console.error('Credenciales incorrectas');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.loginError.set(true);
          console.error('Error del servidor:', err);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
