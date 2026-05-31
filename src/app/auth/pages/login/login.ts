import { Component, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { Rive, StateMachineInput } from '@rive-app/canvas';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login implements AfterViewInit, OnDestroy {
  @ViewChild('riveCanvas') riveCanvas!: ElementRef<HTMLCanvasElement>;

  loginForm: FormGroup;
  showPassword = signal<boolean>(false);
  loginError = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Propiedades para Rive actualizadas con TUS inputs
  private riveInstance: Rive | null = null;
  private isFocusInput: StateMachineInput | null = null;
  private isPasswordInput: StateMachineInput | null = null;
  private eyeTrackInput: StateMachineInput | null = null;
  private loginSuccessInput: StateMachineInput | null = null;
  private loginFailInput: StateMachineInput | null = null;

  // ⚠️ Asegúrate de que tu State Machine se llame 'State Machine 1' o cámbialo aquí
  private readonly STATE_MACHINE_NAME = 'State Machine 1';

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

  ngAfterViewInit(): void {
    this.riveInstance = new Rive({
      src: 'assets/conejo.riv',
      canvas: this.riveCanvas.nativeElement,
      autoplay: true,
      stateMachines: this.STATE_MACHINE_NAME,
      onLoad: () => {
        const inputs = this.riveInstance?.stateMachineInputs(this.STATE_MACHINE_NAME);
        if (inputs) {
          // Conectamos tus inputs exactos
          this.isFocusInput = inputs.find((i) => i.name === 'isFocus') || null;
          this.isPasswordInput = inputs.find((i) => i.name === 'IsPassword') || null;
          this.eyeTrackInput = inputs.find((i) => i.name === 'eye_track') || null;
          this.loginSuccessInput = inputs.find((i) => i.name === 'login_success') || null;
          this.loginFailInput = inputs.find((i) => i.name === 'login_fail') || null;
        }
      },
    });
  }


  onIdentifierFocus(): void {
    if (this.isPasswordInput) this.isPasswordInput.value = false;
    if (this.isFocusInput) this.isFocusInput.value = true;
  }

  onIdentifierInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (this.eyeTrackInput) {
      // Ajusta este multiplicador (* 4) si los ojos se mueven muy lento o muy rápido
      this.eyeTrackInput.value = Math.min(inputElement.value.length * 4, 100);
    }
  }

  onPasswordFocus(): void {
    if (this.isFocusInput) this.isFocusInput.value = false;
    if (this.isPasswordInput) this.isPasswordInput.value = true;
  }

  onBlur(): void {
    if (this.isFocusInput) this.isFocusInput.value = false;
    if (this.isPasswordInput) this.isPasswordInput.value = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);

    if (this.isPasswordInput) {
      this.isPasswordInput.value = !this.showPassword();
    }
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
            this.triggerRiveState(this.loginSuccessInput);

            console.log('Login exitoso, redirigiendo...');
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1500);
          } else {
            this.triggerRiveState(this.loginFailInput);

            this.loginError.set(true);
            console.error('Credenciales incorrectas');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.loginError.set(true);

          this.triggerRiveState(this.loginFailInput);
          console.error('Error del servidor:', err);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private triggerRiveState(input: StateMachineInput | null): void {
    if (!input) return;

    if (typeof (input as any).fire === 'function') {
      (input as any).fire();
    } else {
      input.value = true;
    }
  }

  ngOnDestroy(): void {
    if (this.riveInstance) {
      this.riveInstance.cleanup();
    }
  }
}
