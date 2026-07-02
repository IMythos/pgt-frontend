import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { ProductApiService } from '../../../../services/product-api.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { ModalHeader } from '../../../../../shared/components/modal-header/modal-header';
import { ModalFooter } from '../../../../../shared/components/modal-footer/modal-footer';
import { Btn } from '../../../../../shared/components/btn/btn';

type CatalogType = 'category' | 'brand';

@Component({
  selector: 'app-quick-catalog-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, ModalHeader, ModalFooter, Btn],
  templateUrl: './quick-catalog-modal.html',
})
export class QuickCatalogModal {
  private readonly productApi = inject(ProductApiService);

  readonly type = input.required<CatalogType>();
  readonly close = output<void>();
  readonly saved = output<void>();

  isSaving = signal(false);
  formErrors = signal<Record<string, string>>({});

  name = signal('');
  description = signal('');

  get title(): string {
    return this.type() === 'category' ? 'Nueva Categoría' : 'Nueva Marca';
  }

  get subtitle(): string {
    return this.type() === 'category'
      ? 'Agrega una nueva categoría al catálogo de productos.'
      : 'Agrega una nueva marca al catálogo de productos.';
  }

  updateName(value: string) {
    this.name.set(value);
    this.formErrors.update(err => {
      const copy = { ...err };
      delete copy['name'];
      return copy;
    });
  }

  updateDescription(value: string) {
    this.description.set(value);
  }

  save(): void {
    const nameVal = this.name().trim();
    if (!nameVal) {
      this.formErrors.set({ name: 'El nombre es obligatorio' });
      return;
    }

    this.isSaving.set(true);
    const obs: Observable<any> = this.type() === 'category'
      ? this.productApi.crearCategoria({ name: nameVal, description: this.description().trim() || undefined })
      : this.productApi.crearMarca({ name: nameVal });

    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => this.saved.emit(),
      error: (err: any) => {
        console.error(`Error creando ${this.type()}:`, err);
        const msg = err.error?.message ?? `No se pudo crear la ${this.type() === 'category' ? 'categoría' : 'marca'}.`;
        this.formErrors.set({ general: msg });
      },
    });
  }
}
