import { Component, OnInit, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminApiService } from '../../../../services/admin-api.service';
import { AdminRole } from '../../../../models/admin.models';
import { Modal } from '../../../../../shared/components/modal/modal';
import { ModalHeader } from '../../../../../shared/components/modal-header/modal-header';
import { ModalFooter } from '../../../../../shared/components/modal-footer/modal-footer';

@Component({
  selector: 'app-admin-edit-role-modal',
  imports: [CommonModule, FormsModule, Modal, ModalHeader, ModalFooter],
  templateUrl: './admin-edit-role-modal.html',
})
export class AdminEditRoleModal implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly role = input.required<AdminRole>();
  readonly close = output<void>();
  readonly saved = output<void>();

  isSaving = signal(false);
  formErrors = signal<Record<string, string>>({});

  form = signal({
    name: '',
  });

  ngOnInit(): void {
    this.form.set({ name: this.role().name });
  }

  updateForm(value: string): void {
    this.form.set({ name: value });
    this.formErrors.set({});
  }

  validate(): boolean {
    const name = this.form().name.trim();
    const errors: Record<string, string> = {};
    if (!name) errors['name'] = 'El nombre del rol es obligatorio.';
    else if (name.length < 3) errors['name'] = 'El nombre debe tener al menos 3 caracteres.';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  save(): void {
    if (!this.validate()) return;

    const name = this.form().name.trim();
    this.isSaving.set(true);
    this.adminApi
      .updateRole(this.role().id, name)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.saved.emit(),
        error: (error) => {
          const msg = error.error?.message ?? 'No se pudo actualizar el rol.';
          this.formErrors.set({ general: msg });
        },
      });
  }
}
