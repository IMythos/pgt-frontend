import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminApiService } from '../../../../services/admin-api.service';
import { AdminRole, AdminUser, UpdateAdminUserPayload } from '../../../../models/admin.models';
import { Modal } from '../../../../../shared/components/modal/modal';
import { ModalHeader } from '../../../../../shared/components/modal-header/modal-header';
import { ModalFooter } from '../../../../../shared/components/modal-footer/modal-footer';

@Component({
  selector: 'app-admin-edit-user-modal',
  imports: [CommonModule, FormsModule, Modal, ModalHeader, ModalFooter],
  templateUrl: './admin-edit-user-modal.html',
})
export class AdminEditUserModal implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly user = input.required<AdminUser>();
  readonly roles = input<AdminRole[]>([]);
  readonly close = output<void>();
  readonly saved = output<void>();

  isSaving = signal(false);
  formErrors = signal<Record<string, string>>({});

  form = signal({
    firstName: '',
    lastName: '',
    roleName: '',
  });

  ngOnInit(): void {
    const u = this.user();
    this.form.set({
      firstName: u.firstName,
      lastName: u.lastName,
      roleName: u.roles[0] || '',
    });
  }

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
    if (!f.roleName.trim()) errors['roleName'] = 'Selecciona un rol';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  save(): void {
    if (!this.validate()) return;

    const f = this.form();
    const payload: UpdateAdminUserPayload = {
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      headquarterId: 1,
      roleName: f.roleName.trim(),
    };

    this.isSaving.set(true);
    this.adminApi
      .updateUser(this.user().uuid, payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.saved.emit(),
        error: (error) => {
          const msg = error.error?.message ?? 'No se pudo actualizar el usuario.';
          this.formErrors.set({ general: msg });
        },
      });
  }
}
