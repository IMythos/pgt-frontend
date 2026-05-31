import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService } from '../../../../services/product-api.service';
import {
  CategoriaProductoDto,
  CrearProductoDto,
  MarcaProductoDto,
} from '../../../../models/product.model';

@Component({
  selector: 'app-product-create-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-create-modal.html',
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    .animate-zoom-in { animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `],
})
export class ProductCreateModal {
  private readonly productApi = inject(ProductApiService);

  readonly categorias = input<CategoriaProductoDto[]>([]);
  readonly marcas = input<MarcaProductoDto[]>([]);

  readonly close = output<void>();
  readonly saved = output<void>();

  isSaving = signal(false);
  formProducto = signal({
    idCategoria: null as number | null,
    idMarca: null as number | null,
    sku: '',
    numeroParte: '',
    descripcion: '',
    modelosCompatiblesStr: '',
    precioCompra: null as number | null,
    precioVenta: null as number | null,
    stockMinimo: null as number | null,
    stockInicial: null as number | null,
  });

  guardarProducto(): void {
    const form = this.formProducto();
    if (!form.idCategoria || !form.idMarca || !form.sku || !form.descripcion || form.precioCompra === null || form.precioVenta === null) {
      alert('Por favor completa los campos requeridos: Categoría, Marca, SKU, Descripción, Precios');
      return;
    }
    if (form.precioCompra <= 0 || form.precioVenta <= 0) {
      alert('Los precios deben ser mayores a 0');
      return;
    }
    if (form.stockMinimo !== null && form.stockMinimo < 0) {
      alert('El stock mínimo no puede ser negativo');
      return;
    }
    if (form.stockInicial !== null && form.stockInicial < 0) {
      alert('El stock inicial no puede ser negativo');
      return;
    }
    let modelosCompatibles: string[] = [];
    if (form.modelosCompatiblesStr && form.modelosCompatiblesStr.trim()) {
      modelosCompatibles = form.modelosCompatiblesStr.split(',').map(m => m.trim()).filter(m => m.length > 0);
    }
    const payload: CrearProductoDto = {
      idCategoria: form.idCategoria,
      idMarca: form.idMarca,
      sku: form.sku.toUpperCase(),
      numeroParte: form.numeroParte || null,
      descripcion: form.descripcion,
      modelosCompatibles,
      precioCompra: form.precioCompra,
      precioVenta: form.precioVenta,
      stockMinimo: form.stockMinimo ?? null,
      stockInicial: form.stockInicial ?? null,
    };
    this.isSaving.set(true);
    this.productApi.crear(payload).subscribe({
      next: () => {
        alert('Producto guardado exitosamente!');
        this.limpiarFormulario();
        this.saved.emit();
      },
      error: (err) => {
        console.error('Error guardando producto:', err);
        const msg = err.error?.message || err.error || 'Error al guardar. Verifica consola.';
        alert(`No se pudo guardar:\n${msg}`);
      },
      complete: () => this.isSaving.set(false),
    });
  }

  private limpiarFormulario(): void {
    this.formProducto.set({
      idCategoria: null,
      idMarca: null,
      sku: '',
      numeroParte: '',
      descripcion: '',
      modelosCompatiblesStr: '',
      precioCompra: null,
      precioVenta: null,
      stockMinimo: null,
      stockInicial: null,
    });
  }

  actualizarForm<K extends keyof ReturnType<typeof this.formProducto>>(campo: K, valor: ReturnType<typeof this.formProducto>[K]): void {
    this.formProducto.update((prev) => ({ ...prev, [campo]: valor }));
  }

  parseModelos(str: string | null | undefined): string[] {
    return (str ?? '').split(',').map(m => m.trim()).filter(m => m.length > 0);
  }

  calcularMargenPct(compra: number, venta: number): number {
    return venta > 0 ? ((venta - compra) / venta) * 100 : 0;
  }
}
