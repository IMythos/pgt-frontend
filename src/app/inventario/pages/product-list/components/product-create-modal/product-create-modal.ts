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
import { ConfirmDialog } from '../../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-product-create-modal',
  imports: [CommonModule, FormsModule, Modal, ModalHeader, ModalFooter, ConfirmDialog],
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
  showSuccess = signal(false);
  formErrors = signal<Record<string, string>>({});
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

  validate(): boolean {
    const form = this.formProducto();
    const errors: Record<string, string> = {};
    if (!form.idCategoria) errors['idCategoria'] = 'Campo obligatorio';
    if (!form.idMarca) errors['idMarca'] = 'Campo obligatorio';
    if (!form.sku) errors['sku'] = 'Campo obligatorio';
    if (!form.descripcion) errors['descripcion'] = 'Campo obligatorio';
    if (form.precioCompra === null) errors['precioCompra'] = 'Campo obligatorio';
    else if (form.precioCompra <= 0) errors['precioCompra'] = 'Debe ser mayor a 0';
    if (form.precioVenta === null) errors['precioVenta'] = 'Campo obligatorio';
    else if (form.precioVenta <= 0) errors['precioVenta'] = 'Debe ser mayor a 0';
    if (form.stockMinimo !== null && form.stockMinimo < 0) errors['stockMinimo'] = 'No puede ser negativo';
    if (form.stockInicial !== null && form.stockInicial < 0) errors['stockInicial'] = 'No puede ser negativo';
    if (form.stockInicial !== null && form.stockInicial > 0 && !form.idLocacion) errors['idLocacion'] = 'Selecciona una ubicación para el stock inicial';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  guardarProducto(): void {
    if (!this.validate()) return;

    const form = this.formProducto();
    let modelosCompatibles: string[] = [];
    if (form.modelosCompatiblesStr && form.modelosCompatiblesStr.trim()) {
      modelosCompatibles = form.modelosCompatiblesStr.split(',').map(m => m.trim()).filter(m => m.length > 0);
    }
    const payload: CrearProductoDto = {
      idCategoria: form.idCategoria!,
      idMarca: form.idMarca!,
      sku: form.sku.toUpperCase(),
      numeroParte: form.numeroParte || null,
      descripcion: form.descripcion,
      modelosCompatibles,
      precioCompra: form.precioCompra!,
      precioVenta: form.precioVenta!,
      stockMinimo: form.stockMinimo ?? null,
      stockInicial: form.stockInicial ?? null,
      idLocacion: form.idLocacion ?? null,
    };
    this.isSaving.set(true);
    this.productApi.crear(payload).subscribe({
      next: () => {
        this.limpiarFormulario();
        this.isSaving.set(false);
        this.showSuccess.set(true);
      },
      error: (err) => {
        console.error('Error guardando producto:', err);
        const msg = err.error?.message || err.error || 'Error al guardar. Verifica consola.';
        this.formErrors.set({ general: msg });
        this.isSaving.set(false);
      },
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
    this.formErrors.update((err) => {
      const copy = { ...err };
      delete copy[campo];
      return copy;
    });
  }

  parseModelos(str: string | null | undefined): string[] {
    return (str ?? '').split(',').map(m => m.trim()).filter(m => m.length > 0);
  }

  calcularMargenPct(compra: number, venta: number): number {
    return venta > 0 ? ((venta - compra) / venta) * 100 : 0;
  }
}
