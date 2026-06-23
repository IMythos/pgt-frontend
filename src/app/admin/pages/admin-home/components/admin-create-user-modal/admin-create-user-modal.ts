import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminApiService } from '../../../../services/admin-api.service';
import { AdminRole, CreateAdminUserPayload } from '../../../../models/admin.models';

@Component({
  selector: 'app-admin-create-user-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-create-user-modal.html',
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    .animate-zoom-in { animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `],
})
export class AdminCreateUserModal {
  private readonly adminApi = inject(AdminApiService);

  readonly roles = input<AdminRole[]>([]);
  readonly close = output<void>();
  readonly saved = output<void>();

  isSaving = signal(false);
  formErrors = signal<Record<string, string>>({});

  form = signal({
    firstName: '',
    lastName: '',
    dni: '',
    username: '',
    password: '',
    roleName: '',
  });

  updateForm<K extends keyof ReturnType<typeof this.form>>(
    field: K,
    value: ReturnType<typeof this.form>[K],
  ): void {
    this.form.update((f) => ({ ...f, [field]: value }));
    this.formErrors.update((err) => {
      const copy = { ...err };
      delete copy[field];
      return copy;
    });
  }

  validate(): boolean {
    const f = this.form();
    const errors: Record<string, string> = {};

    if (!f.firstName.trim()) errors['firstName'] = 'Campo obligatorio';
    if (!f.lastName.trim()) errors['lastName'] = 'Campo obligatorio';
    if (!f.dni.trim()) errors['dni'] = 'Campo obligatorio';
    else if (!/^\d{8}$/.test(f.dni)) errors['dni'] = 'Debe tener 8 dígitos';
    if (!f.username.trim()) errors['username'] = 'Campo obligatorio';
    if (!f.password.trim()) errors['password'] = 'Campo obligatorio';
    if (!f.roleName.trim()) errors['roleName'] = 'Selecciona un rol';

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  save(): void {
    if (!this.validate()) return;

    const f = this.form();
    const payload: CreateAdminUserPayload = {
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      dni: f.dni.trim(),
      username: f.username.trim(),
      password: f.password,
      roleName: f.roleName.trim(),
      headquarterId: 1,
    };

    this.isSaving.set(true);
    this.adminApi
      .createUser(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.saved.emit();
        },
        error: (error) => {
          console.error('Error creando usuario:', error);
          const msg = error.error?.message ?? 'No se pudo crear el usuario.';
          this.formErrors.set({ general: msg });
        },
      });
  }
}
