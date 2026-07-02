import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService } from '../../../../services/product-api.service';
import { LocationApiService } from '../../../../services/location-api.service';
import { LocationDto } from '../../../../models/location.model';
import {
  CategoriaProductoDto,
  CrearProductoDto,
  MarcaProductoDto,
} from '../../../../models/product.model';
import { Modal } from '../../../../../shared/components/modal/modal';
import { ModalHeader } from '../../../../../shared/components/modal-header/modal-header';
import { ModalFooter } from '../../../../../shared/components/modal-footer/modal-footer';

@Component({
  selector: 'app-product-create-modal',
  imports: [CommonModule, FormsModule, Modal, ModalHeader, ModalFooter],
  templateUrl: './product-create-modal.html',
})
export class ProductCreateModal implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly locationApi = inject(LocationApiService);

  readonly categorias = input<CategoriaProductoDto[]>([]);
  readonly marcas = input<MarcaProductoDto[]>([]);

  readonly close = output<void>();
  readonly saved = output<void>();
  readonly createCategory = output<void>();
  readonly createBrand = output<void>();

  isSaving = signal(false);
  locaciones = signal<LocationDto[]>([]);
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
    idLocacion: null as string | null,
  });

  ngOnInit(): void {
    this.locationApi.listarActivas().subscribe({
      next: (data) => this.locaciones.set(data),
      error: () => console.error('Error cargando locaciones'),
    });
  }

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
    if (form.stockInicial !== null && form.stockInicial > 0 && !form.idLocacion) {
      alert('Debes seleccionar una ubicación (rack/estante) para el stock inicial');
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
      idLocacion: form.idLocacion ?? null,
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
      idLocacion: null,
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
