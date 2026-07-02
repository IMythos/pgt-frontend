import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminApiService } from '../../../../services/admin-api.service';
import { AdminLocation, AdminWarehouse, CreateLocationPayload, UpdateLocationPayload } from '../../../../models/admin.models';
import { Modal } from '../../../../../shared/components/modal/modal';
import { ModalHeader } from '../../../../../shared/components/modal-header/modal-header';
import { ModalFooter } from '../../../../../shared/components/modal-footer/modal-footer';

@Component({
  selector: 'app-admin-location-modal',
  imports: [CommonModule, FormsModule, Modal, ModalHeader, ModalFooter],
  templateUrl: './admin-location-modal.html',
})
export class AdminLocationModal implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly location = input<AdminLocation | null>(null);
  readonly warehouses = input<AdminWarehouse[]>([]);
  readonly close = output<void>();
  readonly saved = output<void>();

  isSaving = signal(false);
  formErrors = signal<Record<string, string>>({});
  isEditing = signal(false);

  form = signal({
    idAlmacen: 0,
    zona: '',
    pasillo: '',
    estante: '',
    codBarras: '',
    capacidad: 0,
  });

  ngOnInit(): void {
    const loc = this.location();
    if (loc) {
      this.isEditing.set(true);
      this.form.set({
        idAlmacen: loc.idAlmacen,
        zona: loc.zona || '',
        pasillo: loc.pasillo || '',
        estante: loc.estante || '',
        codBarras: loc.codBarras,
        capacidad: loc.capacidad || 0,
      });
    }
  }

  updateForm<K extends keyof ReturnType<typeof this.form>>(
    field: K,
    value: ReturnType<typeof this.form>[K],
  ): void {
    if (field === 'idAlmacen' || field === 'capacidad') {
      value = Number(value) as ReturnType<typeof this.form>[K];
    }
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
    if (!f.idAlmacen) errors['idAlmacen'] = 'Selecciona un almacén';
    if (!f.codBarras.trim()) errors['codBarras'] = 'Campo obligatorio';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  save(): void {
    if (!this.validate()) return;

    const f = this.form();
    this.isSaving.set(true);

    const loc = this.location();
    if (loc) {
      const payload: UpdateLocationPayload = {
        zona: f.zona.trim() || undefined,
        pasillo: f.pasillo.trim() || undefined,
        estante: f.estante.trim() || undefined,
        capacidad: f.capacidad || undefined,
      };
      this.adminApi.updateLocation(loc.idLocacion, payload)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.saved.emit(),
          error: (error) => {
            const msg = error.error?.message ?? 'No se pudo actualizar la ubicación.';
            this.formErrors.set({ general: msg });
          },
        });
    } else {
      const payload: CreateLocationPayload = {
        idAlmacen: f.idAlmacen,
        zona: f.zona.trim() || undefined,
        pasillo: f.pasillo.trim() || undefined,
        estante: f.estante.trim() || undefined,
        codBarras: f.codBarras.trim(),
        capacidad: f.capacidad || undefined,
      };
      this.adminApi.createLocation(payload)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.saved.emit(),
          error: (error) => {
            const msg = error.error?.message ?? 'No se pudo crear la ubicación.';
            this.formErrors.set({ general: msg });
          },
        });
    }
  }
}
