import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminApiService } from '../../../../services/admin-api.service';
import { AdminWarehouse, CreateWarehousePayload, UpdateWarehousePayload } from '../../../../models/admin.models';
import { Modal } from '../../../../../shared/components/modal/modal';
import { ModalHeader } from '../../../../../shared/components/modal-header/modal-header';
import { ModalFooter } from '../../../../../shared/components/modal-footer/modal-footer';

@Component({
  selector: 'app-admin-warehouse-modal',
  imports: [CommonModule, FormsModule, Modal, ModalHeader, ModalFooter],
  templateUrl: './admin-warehouse-modal.html',
})
export class AdminWarehouseModal implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly warehouse = input<AdminWarehouse | null>(null);
  readonly close = output<void>();
  readonly saved = output<void>();

  isSaving = signal(false);
  formErrors = signal<Record<string, string>>({});
  isEditing = signal(false);

  form = signal({
    idSede: 1,
    codAlm: '',
    nombre: '',
    tipo: '',
  });

  ngOnInit(): void {
    const wh = this.warehouse();
    if (wh) {
      this.isEditing.set(true);
      this.form.set({
        idSede: wh.idSede,
        codAlm: wh.codAlm,
        nombre: wh.nombre,
        tipo: wh.tipo || '',
      });
    }
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
    if (!f.codAlm.trim()) errors['codAlm'] = 'Campo obligatorio';
    if (!f.nombre.trim()) errors['nombre'] = 'Campo obligatorio';
    if (!f.idSede) errors['idSede'] = 'Campo obligatorio';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  save(): void {
    if (!this.validate()) return;

    const f = this.form();
    this.isSaving.set(true);

    const wh = this.warehouse();
    if (wh) {
      const payload: UpdateWarehousePayload = {
        codAlm: f.codAlm.trim(),
        nombre: f.nombre.trim(),
        tipo: f.tipo.trim() || undefined,
      };
      this.adminApi.updateWarehouse(wh.id, payload)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.saved.emit(),
          error: (error) => {
            const msg = error.error?.message ?? 'No se pudo actualizar el almacén.';
            this.formErrors.set({ general: msg });
          },
        });
    } else {
      const payload: CreateWarehousePayload = {
        idSede: f.idSede,
        codAlm: f.codAlm.trim(),
        nombre: f.nombre.trim(),
        tipo: f.tipo.trim() || undefined,
      };
      this.adminApi.createWarehouse(payload)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.saved.emit(),
          error: (error) => {
            const msg = error.error?.message ?? 'No se pudo crear el almacén.';
            this.formErrors.set({ general: msg });
          },
        });
    }
  }
}
