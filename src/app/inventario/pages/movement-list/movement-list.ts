import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MovementApiService } from '../../services/movement-api.service';
import { ProductApiService } from '../../services/product-api.service';
import { LocationApiService } from '../../services/location-api.service';
import {
  MovimientoListadoDto,
  RegistrarMovimientoRequest,
  FiltroMovimientoDto,
  TipoMovimiento
} from '../../models/movement.model';
import { ProductoCatalogoDto } from '../../models/product.model';
import { LocationDto } from '../../models/location.model';
import { WebSocketService } from '../../../core/services/websocket.service';
import { scrollLock } from '../../../shared/utils/scroll-lock';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Btn } from '../../../shared/components/btn/btn';
import { Modal } from '../../../shared/components/modal/modal';
import { ModalHeader } from '../../../shared/components/modal-header/modal-header';
import { ModalFooter } from '../../../shared/components/modal-footer/modal-footer';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { HeatmapApiService } from '../../../tracking/services/heatmap-api.service';
import { PickingApiService } from '../../../tracking/services/picking-api.service';
import { LocationProductDto } from '../../../tracking/models/heatmap.model';

interface SalidaItem {
  productoId: string;
  locacionId: string;
  idLote: string;
  productoCod: string;
  productoDesc: string;
  cantidad: number;
}

@Component({
  selector: 'app-movement-list',
  imports: [CommonModule, FormsModule, Pagination, Btn, Modal, ModalHeader, ModalFooter, ConfirmDialog],
  templateUrl: './movement-list.html',
  styleUrl: './movement-list.css',
})
export class MovementList implements OnInit {
  readonly Math = Math;
  private readonly movementApi = inject(MovementApiService);
  private readonly productApi = inject(ProductApiService);
  private readonly locationApi = inject(LocationApiService);
  private readonly ws = inject(WebSocketService);
  private readonly heatmapApi = inject(HeatmapApiService);
  private readonly pickingApi = inject(PickingApiService);

  movements = signal<MovimientoListadoDto[]>([]);
  productos = signal<ProductoCatalogoDto[]>([]);
  locaciones = signal<LocationDto[]>([]);
  loading = signal(false);
  currentPage = signal(0);
  pageSize = signal(10);
  totalItems = signal(0);
  isModalOpen = signal<boolean>(false);
  isSaving = signal(false);
  showSuccess = signal(false);
  successMessage = signal('');
  showError = signal(false);
  errorMessage = signal('');

  filtroTexto = signal('');
  filtroTipo = signal<string>('');
  filtroFecha = signal('');

  formTipo = signal<TipoMovimiento>('INGRESO');
  formProducto = signal('');
  formCantidad = signal<number | null>(null);
  formDocumentoRef = signal('');
  formMotivo = signal('');
  formLocacion = signal('');
  formProveedor = signal('');
  formNroLote = signal('');
  formCostoUnit = signal<number | null>(null);
  formCliente = signal('');
  formTipoAjuste = signal<'POSITIVO' | 'NEGATIVO'>('POSITIVO');

  salidaLocacionId = signal('');
  salidaLocationProducts = signal<LocationProductDto[]>([]);
  salidaQtyMap = signal<Record<string, number>>({});
  salidaItems = signal<SalidaItem[]>([]);

  ajusteLocacionId = signal('');
  ajusteLocationProducts = signal<LocationProductDto[]>([]);
  ajusteItems = signal<SalidaItem[]>([]);
  ajusteSelectedProduct = signal<LocationProductDto | null>(null);
  ajustePendingQty = signal<number>(1);

  ngOnInit(): void {
    this.cargarMovimientos();
    this.cargarProductos();
    this.cargarLocaciones();
    this.ws.onMovement().subscribe(() => this.cargarMovimientos());
  }

  cargarProductos(): void {
    this.productApi.listarCatalogo({ estado: true }).subscribe({
      next: (data) => this.productos.set(data.items),
      error: () => console.error('Error al cargar productos')
    });
  }

  cargarLocaciones(): void {
    this.locationApi.listarActivas().subscribe({
      next: (data) => this.locaciones.set(data),
      error: () => console.error('Error al cargar locaciones')
    });
  }

  cargarMovimientos(): void {
    this.loading.set(true);
    const filtros: FiltroMovimientoDto = {
      pagina: this.currentPage(),
      tamanioPagina: this.pageSize(),
    };
    if (this.filtroTipo()) filtros.tipo = this.filtroTipo() as TipoMovimiento;
    if (this.filtroFecha()) filtros.fechaDesde = this.filtroFecha();
    if (this.filtroTexto()) filtros.texto = this.filtroTexto();

    this.movementApi.listar(filtros).subscribe({
      next: (data) => {
        this.movements.set(data.items ?? []);
        this.totalItems.set(data.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.cargarMovimientos();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.cargarMovimientos();
  }

  openModal(): void {
    this.isModalOpen.set(true);
    scrollLock(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    scrollLock(false);
    this.limpiarFormulario();
  }

  onSuccessClose(): void {
    this.showSuccess.set(false);
    this.closeModal();
    this.cargarMovimientos();
  }

  onErrorClose(): void {
    this.showError.set(false);
  }

  onSalidaLocacionChange(id: string): void {
    this.salidaLocacionId.set(id);
    this.salidaQtyMap.set({});
    if (!id) {
      this.salidaLocationProducts.set([]);
      return;
    }
    this.heatmapApi.obtenerDetalleLocacion(id).subscribe({
      next: (data) => this.salidaLocationProducts.set(data.productos ?? []),
      error: () => {
        this.salidaLocationProducts.set([]);
        console.error('Error al cargar productos de la ubicación');
      }
    });
  }

  setSalidaQty(idLote: string, qty: number): void {
    const num = Math.max(1, Number(qty) || 1);
    this.salidaQtyMap.update(m => ({ ...m, [idLote]: num }));
  }

  isItemAdded(productoCod: string, locacionId: string): boolean {
    return this.salidaItems().some(i => i.productoCod === productoCod && i.locacionId === locacionId);
  }

  agregarItem(prod: LocationProductDto): void {
    const qty = this.salidaQtyMap()[prod.idLote] || 1;
    if (qty <= 0 || qty > prod.cantidad) return;

    const productoId = this.lookupProductoId(prod.productoCod);
    if (!productoId) {
      console.warn(`Producto ${prod.productoCod} no encontrado en catálogo`);
      return;
    }

    if (this.isItemAdded(prod.productoCod, this.salidaLocacionId())) return;

    this.salidaItems.update(items => [...items, {
      productoId,
      locacionId: this.salidaLocacionId(),
      idLote: prod.idLote,
      productoCod: prod.productoCod,
      productoDesc: prod.productoDesc,
      cantidad: qty
    }]);
  }

  eliminarItem(idx: number): void {
    this.salidaItems.update(items => items.filter((_, i) => i !== idx));
  }

  onAjusteLocacionChange(id: string): void {
    this.ajusteLocacionId.set(id);
    this.ajusteSelectedProduct.set(null);
    this.ajustePendingQty.set(1);
    if (!id) {
      this.ajusteLocationProducts.set([]);
      return;
    }
    this.heatmapApi.obtenerDetalleLocacion(id).subscribe({
      next: (data) => this.ajusteLocationProducts.set(data.productos ?? []),
      error: () => {
        this.ajusteLocationProducts.set([]);
        console.error('Error al cargar productos de la ubicación');
      }
    });
  }

  isAjusteItemAdded(productoCod: string): boolean {
    return this.ajusteItems().some(i => i.productoCod === productoCod);
  }

  seleccionarProducto(prod: LocationProductDto): void {
    this.ajusteSelectedProduct.set(prod);
    this.ajustePendingQty.set(1);
  }

  cancelarSeleccionProducto(): void {
    this.ajusteSelectedProduct.set(null);
    this.ajustePendingQty.set(1);
  }

  onAjusteQtyChange(val: any): void {
    this.ajustePendingQty.set(Math.max(1, Number(val) || 1));
  }

  agregarAjusteItem(): void {
    const prod = this.ajusteSelectedProduct();
    if (!prod) return;

    const qty = this.ajustePendingQty();
    if (qty <= 0) return;

    const productoId = this.lookupProductoId(prod.productoCod);
    if (!productoId) {
      console.warn(`Producto ${prod.productoCod} no encontrado en catálogo`);
      return;
    }

    if (this.isAjusteItemAdded(prod.productoCod)) return;

    this.ajusteItems.update(items => [...items, {
      productoId,
      locacionId: this.ajusteLocacionId(),
      idLote: prod.idLote,
      productoCod: prod.productoCod,
      productoDesc: prod.productoDesc,
      cantidad: qty
    }]);
    this.ajusteSelectedProduct.set(null);
    this.ajustePendingQty.set(1);
  }

  eliminarAjusteItem(idx: number): void {
    this.ajusteItems.update(items => items.filter((_, i) => i !== idx));
  }

  getLocationLabel(id: string): string {
    const loc = this.locaciones().find(l => l.idLocacion === id);
    if (!loc) return id;
    return `${loc.zona} - ${loc.pasillo}${loc.estante ? ' - ' + loc.estante : ''}`;
  }

  private lookupProductoId(sku: string): string | null {
    const p = this.productos().find(prod => prod.sku === sku);
    return p ? p.idProducto : null;
  }

  private registrarSalidaPicking(): void {
    if (this.salidaItems().length === 0) return;

    this.isSaving.set(true);
    this.pickingApi.crearDesdeSalida({
      usuarioCreador: 1,
      items: this.salidaItems().map(i => ({
        productoId: i.productoId,
        locacionId: i.locacionId,
        idLote: i.idLote,
        cantidad: i.cantidad
      })),
      motivo: this.formMotivo(),
      docRef: this.formDocumentoRef() || undefined
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('La salida se ha registrado correctamente.');
        this.showSuccess.set(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error en SALIDA:', err);
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : null) || err.message || 'Error al crear orden de picking';
        this.errorMessage.set(msg);
        this.showError.set(true);
      }
    });
  }

  registrarMovimiento(): void {
    let tipo: TipoMovimiento = this.formTipo();

    if (tipo === 'SALIDA') {
      if (!this.formMotivo()) return;
      this.registrarSalidaPicking();
      return;
    }

    if (tipo === 'AJUSTE') {
      if (!this.formMotivo()) return;
      if (this.ajusteItems().length === 0) return;
      this.registrarAjustes();
      return;
    }

    if (!this.formCantidad() || this.formCantidad()! <= 0) return;
    if (!this.formMotivo()) return;
    if (!this.formProducto()) return;
    if (tipo === 'INGRESO' && (!this.formCostoUnit() || this.formCostoUnit()! <= 0)) return;

    if (tipo === 'INGRESO' && !this.formLocacion()) {
      console.warn('La locación es obligatoria para ingresos');
      return;
    }

    const payload: RegistrarMovimientoRequest = {
      tipo,
      cantidad: this.formCantidad()!,
      motivo: this.formMotivo(),
      documentoRef: this.formDocumentoRef() || undefined,
      idProducto: this.formProducto()
    };

    if (tipo === 'INGRESO') {
      if (this.formLocacion()) payload.idLocacion = this.formLocacion();
    }

    if (tipo === 'INGRESO') {
      if (this.formProveedor()) payload.proveedor = this.formProveedor();
      if (this.formNroLote()) payload.nroLote = this.formNroLote();
      payload.costoUnit = this.formCostoUnit()!;
    }

    this.isSaving.set(true);
    this.movementApi.registrar(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('El movimiento se ha registrado correctamente.');
        this.showSuccess.set(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error en INGRESO:', err);
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : null) || err.message || 'Error al registrar movimiento';
        this.errorMessage.set(msg);
        this.showError.set(true);
      }
    });
  }

  private registrarAjustes(): void {
    this.isSaving.set(true);
    const tipoBase = (this.formTipoAjuste() === 'POSITIVO' ? 'AJUSTE_POSITIVO' : 'AJUSTE_NEGATIVO') as TipoMovimiento;
    const items = this.ajusteItems();

    const observables = items.map(item => {
      const payload: RegistrarMovimientoRequest = {
        tipo: tipoBase,
        idProducto: item.productoId,
        idLocacion: item.locacionId,
        cantidad: item.cantidad,
        motivo: this.formMotivo(),
        documentoRef: this.formDocumentoRef() || undefined,
      };

      if (tipoBase === 'AJUSTE_POSITIVO') {
        payload.costoUnit = this.formCostoUnit()!;
        if (this.formProveedor()) payload.proveedor = this.formProveedor();
        if (this.formNroLote()) payload.nroLote = this.formNroLote();
      }

      return this.movementApi.registrar(payload);
    });

    forkJoin(observables).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set(`${items.length} ajuste(s) registrado(s) correctamente.`);
        this.showSuccess.set(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error en AJUSTE:', err);
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : null) || err.message || 'Error registrando ajustes';
        this.errorMessage.set(msg);
        this.showError.set(true);
      }
    });
  }

  setFormTipo(tipo: string): void {
    this.formTipo.set(tipo as any);
    this.formCliente.set('');
    this.formProveedor.set('');
    this.formLocacion.set('');
    this.formNroLote.set('');
    this.formCostoUnit.set(null);
    this.formTipoAjuste.set('POSITIVO');
    this.ajusteLocacionId.set('');
    this.ajusteLocationProducts.set([]);
    this.ajusteItems.set([]);
    this.ajusteSelectedProduct.set(null);
    this.ajustePendingQty.set(1);
  }

  setFormTipoAjuste(valor: string): void {
    if (valor === 'POSITIVO' || valor === 'NEGATIVO') {
      this.formTipoAjuste.set(valor);
    }
  }

  private limpiarFormulario(): void {
    this.formTipo.set('INGRESO');
    this.formProducto.set('');
    this.formCantidad.set(null);
    this.formDocumentoRef.set('');
    this.formMotivo.set('');
    this.formLocacion.set('');
    this.formProveedor.set('');
    this.formNroLote.set('');
    this.formCostoUnit.set(null);
    this.formCliente.set('');
    this.formTipoAjuste.set('POSITIVO');
    this.salidaLocacionId.set('');
    this.salidaLocationProducts.set([]);
    this.salidaQtyMap.set({});
    this.salidaItems.set([]);
    this.ajusteLocacionId.set('');
    this.ajusteLocationProducts.set([]);
    this.ajusteItems.set([]);
    this.ajusteSelectedProduct.set(null);
    this.ajustePendingQty.set(1);
  }

  getMovementBadgeClass(type: string): string {
    switch(type) {
      case 'INGRESO':
        return 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]';
      case 'SALIDA':
        return 'border border-[#EF4444] text-[#EF4444]';
      case 'AJUSTE':
      case 'AJUSTE_POSITIVO':
      case 'AJUSTE_NEGATIVO':
        return 'bg-gray-100 dark:bg-[#1F1F1F] text-[#4C616C] dark:text-[#8A9BA8]';
      default:
        return 'bg-gray-100 dark:bg-[#1F1F1F] text-[#4C616C] dark:text-[#8A9BA8]';
    }
  }

  getQuantityClass(type: string): string {
    if (type === 'INGRESO' || type === 'AJUSTE_POSITIVO') return 'text-[#34A853]';
    if (type === 'SALIDA' || type === 'AJUSTE_NEGATIVO') return 'text-[#111D23] dark:text-white';
    return 'text-[#B45309]';
  }

  formatQuantity(mov: MovimientoListadoDto): string {
    if (mov.cantidadIngreso > 0) return `+${mov.cantidadIngreso}`;
    if (mov.cantidadSalida > 0) return `-${mov.cantidadSalida}`;
    return '0';
  }

  getQuantityValue(mov: MovimientoListadoDto): number {
    return mov.cantidadIngreso > 0 ? mov.cantidadIngreso : mov.cantidadSalida;
  }
}
