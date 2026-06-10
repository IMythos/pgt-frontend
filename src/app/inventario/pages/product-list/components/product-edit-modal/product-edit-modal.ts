import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService } from '../../../../services/product-api.service';
import {
  ActualizarProductoDto,
  CategoriaProductoDto,
  MarcaProductoDto,
  ProductoCatalogoDto,
} from '../../../../models/product.model';

@Component({
  selector: 'app-product-edit-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-edit-modal.html',
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    .animate-zoom-in { animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `],
})
export class ProductEditModal {
  private readonly productApi = inject(ProductApiService);

  readonly productId = input.required<string>();
  readonly product = input.required<ProductoCatalogoDto>();
  readonly categorias = input<CategoriaProductoDto[]>([]);
  readonly marcas = input<MarcaProductoDto[]>([]);

  readonly close = output<void>();
  readonly updated = output<void>();

  isUpdating = signal(false);
  editFormProducto = signal({
    idCategoria: null as number | null,
    idMarca: null as number | null,
    numeroParte: '' as string | null,
    descripcion: '',
    modelosCompatiblesStr: '',
    estado: true,
  });

  actualizarProducto(): void {
    const form = this.editFormProducto();
    const id = this.productId();
    if (!id) return;
    if (!form.idCategoria || !form.idMarca || !form.descripcion) {
      alert('Completa los campos requeridos: Categoría, Marca, Descripción');
      return;
    }
    let modelosCompatibles: string[] = [];
    if (form.modelosCompatiblesStr && form.modelosCompatiblesStr.trim()) {
      modelosCompatibles = form.modelosCompatiblesStr.split(',').map(m => m.trim()).filter(m => m.length > 0);
    }
    const payload: ActualizarProductoDto = {
      idCategoria: form.idCategoria,
      idMarca: form.idMarca,
      numeroParte: form.numeroParte || null,
      descripcion: form.descripcion,
      modelosCompatibles,
      estado: form.estado,
    };
    this.isUpdating.set(true);
    this.productApi.actualizar(id, payload).subscribe({
      next: () => {
        alert('Producto actualizado exitosamente!');
        this.updated.emit();
      },
      error: (err) => {
        console.error('Error actualizando producto:', err);
        const msg = err.error?.message || err.error || 'Error al actualizar. Verifica consola.';
        alert(`No se pudo actualizar:\n${msg}`);
      },
      complete: () => this.isUpdating.set(false),
    });
  }

  actualizarEditForm<K extends keyof ReturnType<typeof this.editFormProducto>>(campo: K, valor: ReturnType<typeof this.editFormProducto>[K]): void {
    this.editFormProducto.update((prev) => ({ ...prev, [campo]: valor }));
  }

  parseModelos(str: string | null | undefined): string[] {
    return (str ?? '').split(',').map(m => m.trim()).filter(m => m.length > 0);
  }

  getEditingProductSku(): string {
    return this.product()?.sku ?? '';
  }
}
