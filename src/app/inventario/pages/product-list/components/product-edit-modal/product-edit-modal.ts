import { Component, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService } from '../../../../services/product-api.service';
import {
  ActualizarProductoDto,
  CategoriaProductoDto,
  MarcaProductoDto,
  ProductoCatalogoDto,
} from '../../../../models/product.model';
import { Modal } from '../../../../../shared/components/modal/modal';
import { ModalHeader } from '../../../../../shared/components/modal-header/modal-header';
import { ModalFooter } from '../../../../../shared/components/modal-footer/modal-footer';

@Component({
  selector: 'app-product-edit-modal',
  imports: [CommonModule, FormsModule, Modal, ModalHeader, ModalFooter],
  templateUrl: './product-edit-modal.html',
})
export class ProductEditModal {
  private readonly productApi = inject(ProductApiService);

  readonly productId = input.required<string>();
  readonly product = input.required<ProductoCatalogoDto>();
  readonly categorias = input<CategoriaProductoDto[]>([]);
  readonly marcas = input<MarcaProductoDto[]>([]);

  readonly close = output<void>();
  readonly updated = output<void>();
  readonly createCategory = output<void>();
  readonly createBrand = output<void>();

  isUpdating = signal(false);
  formErrors = signal<Record<string, string>>({});
  editFormProducto = signal({
    idCategoria: null as number | null,
    idMarca: null as number | null,
    numeroParte: '' as string | null,
    descripcion: '',
    modelosCompatiblesStr: '',
    estado: true,
  });

  private initForm = effect(() => {
    const p = this.product();
    if (p) {
      this.editFormProducto.set({
        idCategoria: p.categoria?.idCategoria ?? null,
        idMarca: p.marca?.idMarca ?? null,
        numeroParte: p.numeroParte ?? '',
        descripcion: p.descripcion,
        modelosCompatiblesStr: (p.modelosCompatibles ?? []).join(', '),
        estado: p.estado,
      });
    }
  });

  validate(): boolean {
    const form = this.editFormProducto();
    const errors: Record<string, string> = {};
    if (!form.idCategoria) errors['idCategoria'] = 'Campo obligatorio';
    if (!form.idMarca) errors['idMarca'] = 'Campo obligatorio';
    if (!form.descripcion) errors['descripcion'] = 'Campo obligatorio';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  actualizarProducto(): void {
    if (!this.validate()) return;

    const form = this.editFormProducto();
    const id = this.productId();
    if (!id) return;
    let modelosCompatibles: string[] = [];
    if (form.modelosCompatiblesStr && form.modelosCompatiblesStr.trim()) {
      modelosCompatibles = form.modelosCompatiblesStr.split(',').map(m => m.trim()).filter(m => m.length > 0);
    }
    const payload: ActualizarProductoDto = {
      idCategoria: form.idCategoria!,
      idMarca: form.idMarca!,
      numeroParte: form.numeroParte || null,
      descripcion: form.descripcion,
      modelosCompatibles,
      estado: form.estado,
    };
    this.isUpdating.set(true);
    this.productApi.actualizar(id, payload).subscribe({
      next: () => {
        this.updated.emit();
      },
      error: (err) => {
        console.error('Error actualizando producto:', err);
        const msg = err.error?.message || err.error || 'Error al actualizar. Verifica consola.';
        this.formErrors.set({ general: msg });
      },
      complete: () => this.isUpdating.set(false),
    });
  }

  actualizarEditForm<K extends keyof ReturnType<typeof this.editFormProducto>>(campo: K, valor: ReturnType<typeof this.editFormProducto>[K]): void {
    this.editFormProducto.update((prev) => ({ ...prev, [campo]: valor }));
    this.formErrors.update((err) => {
      const copy = { ...err };
      delete copy[campo];
      return copy;
    });
  }

  parseModelos(str: string | null | undefined): string[] {
    return (str ?? '').split(',').map(m => m.trim()).filter(m => m.length > 0);
  }

  getEditingProductSku(): string {
    return this.product()?.sku ?? '';
  }
}
